import {FormEvent} from 'react'
import {gridConfig, gridPoints} from '../stores/grid'
import {stormData} from '../stores/storm'
import {api} from '../utils/api'
import {FormInput} from './form.input'

const runParams = [
  {name: 'dt', label: 'Time interval (seconds)', value: 60},
  {name: 'tide_amplitude', label: 'Tide amplitude (meters)', value: 0.6},
  {name: 'tide_phase', label: 'Tide phase (degree)', value: 0},
]

export const RunProgram = () => {
  return (
    <form onSubmit={(e) => run(e)}>
      <fieldset>
        {runParams.map((row, idx) => (
          <FormInput {...row} key={idx} />
        ))}
        <input type="submit" value="run" />
      </fieldset>
    </form>
  )
}

type RunConfig = {
  dt: number
  tide_amplitude: number
  tide_phase: number
}
type RunFormData = Iterable<[keyof RunConfig, string]>

const run = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget) as unknown as RunFormData
  const data = {} as RunConfig
  ;[...formData].forEach(([name, value]) => (data[name] = +value))
  await api
    .url('/run')
    .post({grid: gridPoints.value, grid_params: gridConfig.value, run_params: data, storm: stormData.value})
}
