import {Card} from './card'
import {LoadFile} from './load.file'
import {loadFile} from '../utils/file.load'
import {selectedPoint, setupGrid} from '../stores/grid'
import {stormData, stormLocations} from '../stores/storm'
import {coastLevelMax, coastLevelMin, Coasts, coasts, observed, resetCoasts} from '../stores/coast'
import {fitToGrid} from '../hooks/grid.fit'
import {showCard} from '../stores'

export const CoastsCard = () => {
  return (
    showCard.value && (
      <Card>
        <LoadFile id="coasts-file" label="Load coast files" onChange={loadCoasts} multiple />
        {Object.keys(coasts.value).length > 0 && (
          <>
            <LoadFile id="observed-file" label="Load observed file" onChange={loadObserved} />
            <button type="button" onClick={resetCoasts}>
              Clear
            </button>
            <button type="button" onClick={fitToGrid}>
              Fit map
            </button>
          </>
        )}
      </Card>
    )
  )
}

const loadCoasts = loadFile({
  async onLoad(e: ProgressEvent<FileReader>, fileIndex: number) {
    const {surge, tide, ...data} = JSON.parse(e.target?.result as string)
    const key = surge && tide ? 'both' : surge ? 'surge' : tide ? 'tide' : ''
    if (key === '') return
    if (fileIndex === 0) {
      await setupGrid(data.grid_params, data.grid)
      stormData.value = data.storm
    }
    if (data.storm_locations.length > 0) {
      stormLocations.value = data.storm_locations
    }
    const coasts_data: Coasts = {...coasts.value}
    let [dMin, dMax] = [coastLevelMin.value, coastLevelMax.value]
    const findMinMax = (v: number) => {
      if (v > dMax) dMax = v
      if (v < dMin) dMin = v
    }
    data.coasts.forEach(({row, column, data: values}: {row: number; column: number; data: number[]}) => {
      if (coasts_data[row] === undefined) {
        coasts_data[row] = {}
      }
      if (coasts_data[row][column] === undefined) {
        coasts_data[row][column] = {both: [], surge: [], tide: []}
      }

      coasts_data[row][column][key] = values.map((v, i) => {
        findMinMax(v)
        return [(i * data.run_params.dt + data.start_timestamp) * 1000, v]
      })
    })
    coastLevelMin.value = dMin
    coastLevelMax.value = dMax
    coasts.value = coasts_data
    if (selectedPoint.value.row < 0 || selectedPoint.value.column < 0) {
      const row = +Object.keys(coasts_data)[0] || -1
      const column = +Object.keys(coasts_data[row] || {})[0] || -1
      selectedPoint.value = {row, column}
    }
  },
})

const loadObserved = loadFile({
  async onLoad(e: ProgressEvent<FileReader>) {
    const {values} = JSON.parse(e.target?.result as string) as {values: {timestamp: number; sea_level: number}[]}
    let [dMin, dMax] = [coastLevelMin.value, coastLevelMax.value]
    const findMinMax = (v: number) => {
      if (v > dMax) dMax = v
      if (v < dMin) dMin = v
    }
    observed.value = values.map((x) => {
      findMinMax(x.sea_level)
      return [x.timestamp * 1000, x.sea_level]
    })
    coastLevelMin.value = dMin
    coastLevelMax.value = dMax
  },
})
