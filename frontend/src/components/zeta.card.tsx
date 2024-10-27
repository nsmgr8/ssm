import {LoadFile} from './load.file'
import {GridConfig, GridPoint, setupGrid} from '../stores/grid'
import {StormData, stormData} from '../stores/storm'
import {
  currentZetaIdx,
  getBands,
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
import {computed} from '@preact/signals-react'
import {IntervalType} from '../utils/types'
import {fitToGrid} from '../hooks/grid.fit'

export const ZetaCard = () => {
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
    <Card>
      <LoadFile id="zeta-file" label="Load zeta files" onChange={loadZeta} multiple />
      {zetas.value.both.length > 0 && (
        <>
          <div style={{display: 'flex', gap: 5, marginBottom: '5px'}}>
            <button type="button" onClick={nextZeta(-1)}>
              Previous
            </button>
            <button type="button" onClick={nextZeta(1)}>
              Next
            </button>
            <button type="button" onClick={play}>
              Play
            </button>
            <button type="button" onClick={pause}>
              Pause
            </button>
            <button type="button" onClick={clear}>
              Clear
            </button>
            <button type="button" onClick={fitToGrid}>
              Fit map
            </button>
          </div>
          <div>
            <div style={{display: 'grid', gridTemplateColumns: `repeat(${numBands.value + 1}, 1fr)`}}>
              {getBands(numBands.value).map(({color: [r, g, b]}, idx) => (
                <div key={idx} style={{backgroundColor: `rgb(${r}, ${g}, ${b})`}}>
                  &nbsp;
                </div>
              ))}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              {zetaBands.value.map((x) => (
                <span key={x}>{x.toFixed(1)}</span>
              ))}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 10}}>
              <label htmlFor="id-num-bands">Bands ({numBands.value})</label>
              <input
                style={{flexGrow: 1}}
                type="range"
                defaultValue={numBands.value}
                min={10}
                max={100}
                step={1}
                onChange={({target: {value}}) => (numBands.value = +value)}
              />
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

const zetaBands = computed(() => {
  const diff = zetaMax.value - zetaMin.value
  return [
    zetaMin.value,
    zetaMin.value + diff / 4,
    zetaMin.value + diff / 2,
    zetaMin.value + (diff / 4) * 3,
    zetaMax.value,
  ]
})

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
    let [minVal, maxVal] = [zetaMin.value, zetaMax.value]
    data.zetas.forEach(({data: d}) =>
      d.forEach((v) => {
        if (v[2] < minVal) minVal = v[2]
        if (v[2] > maxVal) maxVal = v[2]
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
