import {FormEvent, useCallback} from 'react'
import {GridConfig, gridConfig, gridMatrix, gridPoints, setupGrid, showUVZ} from '../stores/grid'
import {LoadFile} from './load.file'
import {api} from '../utils/api'
import {FormInput} from './form.input'
import {loadFile} from '../utils/file.load'
import {fitToGrid} from '../hooks/grid.fit'
import {useMap} from 'react-map-gl'

export const GridConfigForm = () => {
  return (
    <form onSubmit={submitGridConf}>
      <fieldset>
        <legend>Grid</legend>
        <LoadFile id="input-map-file" label="Load grid" onChange={onLoadGrid} />
        <FormInput name="m" value={gridConfig.value.m} min={1} label="Number of rows (m)" />
        <FormInput name="n" value={gridConfig.value.n} min={1} label="Number of columns (n)" />
        <FormInput name="dr" value={gridConfig.value.dr} min={1} label="Radial interval (meters)" />
        <FormInput name="e" value={gridConfig.value.e} max={0.999999} label="Ellipse eccentricity (0 <= e < 1)" />
        <FormInput
          name="alpha"
          value={gridConfig.value.alpha}
          min={-359.99999}
          max={359.99999}
          label="Start angle (degree)"
        />
        <FormInput
          name="beta"
          value={gridConfig.value.beta}
          min={-359.99999}
          max={359.99999}
          label="Stop angle (degree)"
        />
        <FormInput
          name="origin.longitude"
          value={gridConfig.value.origin?.longitude}
          min={-180}
          max={180}
          label="Origin longitude (degree)"
        />
        <FormInput
          name="origin.latitude"
          value={gridConfig.value.origin?.latitude}
          min={-90}
          max={90}
          label="Origin latitude (degree)"
        />
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <input type="submit" value="Update" />
          <DetectGrid />
          <button type="button" onClick={fitToGrid}>
            Fit map
          </button>
          <button type="button" onClick={save}>
            Save
          </button>
        </div>
      </fieldset>
    </form>
  )
}

type GridConfigWithoutOrigin = keyof Omit<GridConfig, 'origin'>
type GridInputField = GridConfigWithoutOrigin | 'origin.longitude' | 'origin.latitude'
type GridFormData = Iterable<[GridInputField, string]>

const submitGridConf = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget) as unknown as GridFormData
  const data = {...gridConfig.value}
  if (data.origin === undefined) {
    data.origin = {} as GridConfig['origin']
  }
  ;[...formData].forEach(([name, value]) => {
    if (name.startsWith('origin.')) {
      data.origin[name.replace('origin.', '') as 'latitude' | 'longitude'] = +value
    } else {
      data[name as GridConfigWithoutOrigin] = +value
    }
  })
  gridConfig.value = data
}

const onLoadGrid = loadFile({
  init() {
    showUVZ.value = false
    gridConfig.value = {} as GridConfig
  },
  async onLoad(e: ProgressEvent<FileReader>) {
    const {grid, config} = JSON.parse(e.target?.result as string)
    await setupGrid(config, grid)
  },
})

const save = async () => {
  const fname = prompt('Grid name:')
  await api.url(`/grid-config?name=${fname}`).post({config: gridConfig.value, grid: gridPoints.value})
}

const DetectGrid = () => {
  const {default: map} = useMap()
  const detect = useCallback(() => {
    if (!map) return
    const points = gridPoints.value.map((row) => row.map((col) => col))
    gridMatrix.value.forEach((row, i) => {
      row.forEach((col, j) => {
        const hasWater = map.queryRenderedFeatures(map.project(col), {layers: ['water', 'water_shadow']}).length > 0
        points[i][j] = hasWater ? 1 : 0
      })
    })
    gridPoints.value = points
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, gridMatrix.value])
  return (
    <button type="button" onClick={detect}>
      Detect
    </button>
  )
}
