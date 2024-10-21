import {Card} from './card'
import {LoadFile} from './load.file'
import {loadFile} from '../utils/file.load'
import {setupGrid} from '../stores/grid'
import {stormData} from '../stores/storm'
import {coastLevelMax, coastLevelMin, Coasts, coasts} from '../stores/coast'

export const CoastsCard = () => {
  return (
    <Card>
      <LoadFile id="coasts-file" label="Coasts file" onChange={loadCoasts} multiple />
      {Object.keys(coasts.value).length > 0 && (
        <LoadFile id="observed-file" label="Observed file" onChange={loadObserved} />
      )}
    </Card>
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
        coasts_data[row][column] = values.map((v, i) => {
          findMinMax(v)
          return {
            [key]: v,
            time: (i * data.run_params.dt + data.start_timestamp) * 1000,
          }
        })
      } else {
        values.forEach((v, i) => {
          findMinMax(v)
          coasts_data[row][column][i][key] = v
        })
      }
    })
    coastLevelMin.value = Math.floor(dMin)
    coastLevelMax.value = Math.ceil(dMax)
    coasts.value = coasts_data
  },
})

const loadObserved = loadFile({
  async onLoad(e: ProgressEvent<FileReader>) {
    const data = JSON.parse(e.target?.result as string)
    const values: {time: number; value: number}[] = data.values.map((x: {timestamp: number; sea_level: number}) => ({
      time: x.timestamp * 1000,
      value: x.sea_level,
    }))
    const coasts_data: any = {}
    Object.entries(coasts.value).forEach(([row, columnData]) => {
      coasts_data[row] = {}
      Object.entries(columnData).forEach(([column, data]) => {
        coasts_data[row][column] = data.map((v) => {
          let observed = values.find((x) => x.time === v.time)
          if (observed) {
            v.observed = observed.value
          }
          return v
        })
      })
    })
    coasts.value = {...coasts_data}
  },
})
