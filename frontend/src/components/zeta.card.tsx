import {LoadFile} from './load.file'
import {GridConfig, GridPoint, setupGrid} from '../stores/grid'
import {StormData, stormData} from '../stores/storm'
import {
  currentBandColor,
  currentZetaIdx,
  numBands,
  resetZeta,
  stormStartedAt,
  zetaDt,
  zetaMax,
  zetaMin,
  zetas,
} from '../stores/zeta'
import {Card} from './card'
import {loadFile} from '../utils/file.load'
import {useCallback, useEffect, useState} from 'react'
import {IntervalType} from '../utils/types'
import {fitToGrid} from '../hooks/grid.fit'
import {showCard} from '../stores'
import {availableBands, colorBands} from '../utils/colors'
import {ColorBands} from './contour.bands'
import {runParams, RunParams} from './run.params'

export const ZetaCard = () => {
  return (
    showCard.value && (
      <Card>
        <LoadFile id="zeta-file" label="Load zeta files" onChange={loadZeta} multiple />
        {zetas.value.both.length > 0 && (
          <div>
            <ZetaButtons />
            <ZetaBands />
          </div>
        )}
        <RunParams />
      </Card>
    )
  )
}

const ZetaBands = () => {
  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 10}}>
        <label htmlFor="id-num-bands">Bands ({numBands.value})</label>
        <input
          style={{flexGrow: 1}}
          type="range"
          defaultValue={numBands.value}
          min={10}
          max={40}
          step={1}
          onChange={({target: {value}}) => (numBands.value = +value)}
        />
      </div>
      <div style={{height: '100px', overflow: 'scroll'}}>
        {Object.entries(availableBands).map(([name, f]) => (
          <label key={name} htmlFor={`id-color-radio-${name}`}>
            <div style={{display: 'flex', margin: '3px 0'}}>
              <input
                type="radio"
                name="_"
                id={`id-color-radio-${name}`}
                onClick={() => (currentBandColor.value = name)}
                defaultChecked={currentBandColor.value === name}
              />
              <div style={{flexGrow: 1}}>
                <ColorBands bands={colorBands(f)} />
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

const ZetaButtons = () => {
  const [playId, setPlayId] = useState<IntervalType>()

  useEffect(() => () => clearInterval(playId), [playId])

  const play = useCallback(() => {
    if (!playId) {
      setPlayId(setInterval(forwardZeta, 300))
    }
  }, [playId])

  const pause = useCallback(() => {
    clearInterval(playId)
    setPlayId(undefined)
  }, [playId])

  const clear = useCallback(() => {
    resetZeta()
    pause()
  }, [pause])

  return (
    <div style={{display: 'flex', gap: 5, marginBottom: '5px'}}>
      <button type="button" title="Minimum Sea Level" onClick={() => (currentZetaIdx.value = zetaMin.value.index)}>
        &darr;
      </button>
      <button type="button" title="Maximum Sea Level" onClick={() => (currentZetaIdx.value = zetaMax.value.index)}>
        &uarr;
      </button>
      {!playId && (
        <button type="button" title="Play" onClick={play}>
          &#x23F5;
        </button>
      )}
      {playId && (
        <button type="button" title="Pause" onClick={pause}>
          &#x23F8;
        </button>
      )}
      <button type="button" title="Previous" onClick={nextZeta(-1)}>
        &larr;
      </button>
      <button type="button" title="Next" onClick={nextZeta(1)}>
        &rarr;
      </button>
      <button type="button" title="Reset" onClick={clear}>
        &#x1F5D1;
      </button>
      <button type="button" title="Fit map" onClick={fitToGrid}>
        &#x26F6;
      </button>
    </div>
  )
}

const nextZeta = (direction: 1 | -1) => () => {
  const idx = currentZetaIdx.value + direction
  if (idx >= zetas.value.both.length) {
    currentZetaIdx.value = 0
  } else if (idx < 0) {
    currentZetaIdx.value = zetas.value.both.length - 1
  } else {
    currentZetaIdx.value = idx
  }
}

const forwardZeta = nextZeta(1)

type ZetaRaw = {
  surge: boolean
  tide: boolean
  zetas: {
    data: [number, number, number][]
  }[]
  grid_params: GridConfig
  run_params: any
  grid: GridPoint[][]
  storm: StormData
  store_dt: number
  started_at: string
}

const loadZeta = loadFile({
  init: resetZeta,

  async onLoad(e: ProgressEvent<FileReader>, idx: number) {
    const {surge, tide, ...data} = JSON.parse(e.target?.result as string) as ZetaRaw
    const key = surge && tide ? 'both' : surge ? 'surge' : tide ? 'tide' : null
    if (!key) return
    runParams.value = {...data.grid_params, ...data.run_params}
    let [minVal, maxVal] = [zetaMin.value, zetaMax.value]
    data.zetas.forEach(({data: d}, index) =>
      d.forEach((v) => {
        if (v[2] < minVal.value) minVal = {value: v[2], index}
        if (v[2] > maxVal.value) maxVal = {value: v[2], index}
      })
    )
    if (idx === 0) {
      await setupGrid(data.grid_params, data.grid)
      stormData.value = data.storm
      stormStartedAt.value = +new Date(data.started_at)
      zetaDt.value = data.store_dt * 1000
    }
    zetaMin.value = minVal
    zetaMax.value = maxVal
    zetas.value = {...zetas.value, [key]: data.zetas}
    currentZetaIdx.value = 0
  },
})
