import {LoadFile} from './load.file'
import {setupGrid} from '../stores/grid'
import {stormData} from '../stores/storm'
import {currentZetaIdx, getBands, resetZeta, stormStartedAt, zetaDt, zetaMax, zetaMin, zetas} from '../stores/zeta'
import {Card} from './card'
import {loadFile} from '../utils/file.load'
import {useCallback, useState} from 'react'

export const ZetaCard = () => {
  const [playTimeout, setPlayTimeout] = useState<any>()
  const play = useCallback(() => {
    const run = () => {
      const timeout = setTimeout(() => {
        nextZeta(1)()
        if (currentZetaIdx.value < zetas.value.both.length - 1) run()
      }, 300)
      setPlayTimeout(timeout)
      return timeout
    }
    const timeout = run()
    return () => clearTimeout(timeout)
  }, [playTimeout])

  return (
    <Card>
      <LoadFile id="zeta-file" label="Zeta file" onChange={loadZeta} multiple />
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
            <button type="button" onClick={() => clearTimeout(playTimeout)}>
              Pause
            </button>
            <button type="button" onClick={() => resetZeta()}>
              Clear
            </button>
          </div>
          <div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)'}}>
              {getBands().map(({color: [r, g, b]}, idx) => (
                <div key={idx} style={{backgroundColor: `rgb(${r}, ${g}, ${b})`}}>
                  &nbsp;
                </div>
              ))}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <span>{zetaMin.value}</span>
              <span>{zetaMin.value / 4}</span>
              <span>{zetaMin.value / 2}</span>
              <span>{(zetaMin.value / 4) * 3}</span>
              <span>{zetaMax.value}</span>
            </div>
          </div>
        </>
      )}
    </Card>
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

const loadZeta = loadFile({
  init: resetZeta,

  async onLoad(e: ProgressEvent<FileReader>, idx: number) {
    const {surge, tide, ...data} = JSON.parse(e.target?.result as string)
    const key = surge && tide ? 'both' : surge ? 'surge' : tide ? 'tide' : null
    if (!key) return
    let [minVal, maxVal] = [zetaMin.value, zetaMax.value]
    data.zetas.forEach(({data: d}) =>
      d.forEach(([_, __, v]) => {
        if (v < minVal) minVal = v
        if (v > maxVal) maxVal = v
      })
    )
    if (idx === 0) {
      await setupGrid(data.grid_params, data.grid)
      stormData.value = data.storm
      stormStartedAt.value = +new Date(data.started_at)
      zetaDt.value = data.store_dt
    }
    zetaMin.value = Math.floor(minVal)
    zetaMax.value = Math.ceil(maxVal)
    zetas.value = {...zetas.value, [key]: data.zetas}
    currentZetaIdx.value = 0
  },
})