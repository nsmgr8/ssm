import {FormEvent} from 'react'
import {GridConfig, gridConfig, gridPoints, setupGrid, showUVZ} from '../stores/grid'
import {LoadFile} from './load.file'
import {api} from '../utils/api'
import {FormInput} from './form.input'
import {loadFile} from '../utils/file.load'
import {fitToGrid} from '../hooks/grid.fit'

export const GridConfigForm = () => (
  <form onSubmit={submitGridConf}>
    <fieldset>
      <legend>Grid</legend>
      <LoadFile id="input-map-file" label="Load grid" onChange={loadFile({init: initGrid, onLoad: onFileLoad})} />
      <FormInput name="m" value={gridConfig.value.m} label="Number of rows (m)" />
      <FormInput name="n" value={gridConfig.value.n} label="Number of columns (n)" />
      <FormInput name="dr" value={gridConfig.value.dr} label="Radial interval (meters)" />
      <FormInput name="e" value={gridConfig.value.e} label="Ellipse eccentricity (0 <= e < 1)" />
      <FormInput name="alpha" value={gridConfig.value.alpha} label="Start angle (degree)" />
      <FormInput name="beta" value={gridConfig.value.beta} label="Stop angle (degree)" />
      <FormInput name="origin.longitude" value={gridConfig.value.origin?.longitude} label="Origin longitude (degree)" />
      <FormInput name="origin.latitude" value={gridConfig.value.origin?.latitude} label="Origin latitude (degree)" />
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <input type="submit" value="Update" />
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

type GridConfigWithoutOrigin = keyof Omit<GridConfig, 'origin'>
type GridInputField = GridConfigWithoutOrigin | 'origin.longitude' | 'origin.latitude'
type GridFormData = Iterable<[GridInputField, string]>

const submitGridConf = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget) as unknown as GridFormData
  const data = {...gridConfig.value}
  ;[...formData].forEach(([name, value]) => {
    if (name.startsWith('origin.')) {
      data.origin[name.replace('origin.', '') as 'latitude' | 'longitude'] = +value
    } else {
      data[name as GridConfigWithoutOrigin] = +value
    }
  })
  gridConfig.value = data
}

const initGrid = () => {
  showUVZ.value = false
  gridConfig.value = {} as GridConfig
}
const onFileLoad = async (e: ProgressEvent<FileReader>) => {
  const {grid, config} = JSON.parse(e.target?.result as string)
  await setupGrid(config, grid)
}

const save = async () => {
  const fname = prompt('Grid name:')
  await api.url(`/grid-config?name=${fname}`).post({config: gridConfig.value, grid: gridPoints.value})
}
