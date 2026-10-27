import {signal} from '@preact/signals-react'
import {formattedLngLat} from '../utils/formats'

export const RunParams = () => {
  const params = runParams.value
  return (
    params.m && (
      <table className="run-params">
        <tbody>
          <tr>
            <th>Grid size</th>
            <td>
              {params.m}X{params.n}
            </td>
          </tr>
          <tr>
            <th>Radial interval</th>
            <td>{params.dr}</td>
            <td>meters</td>
          </tr>
          <tr>
            <th>Origin</th>
            <td>{formattedLngLat([params.origin.longitude, params.origin.latitude])}</td>
          </tr>
          <tr>
            <th>Angles (start, end)</th>
            <td>
              ({params.alpha}°, {params.beta}°){' '}
            </td>
          </tr>
          <tr>
            <th>Ellipse eccentricity {'(0 <= e < 1)'}</th>
            <td>{params.e}</td>
          </tr>
          <tr>
            <th>Time interval</th>
            <td>{params.dt}</td>
            <td>seconds</td>
          </tr>
          <tr>
            <th>Tide amplitude</th>
            <td>{params.tide_amplitude}</td>
            <td>meters</td>
          </tr>
          <tr>
            <th>Tide phase</th>
            <td>{params.tide_phase}</td>
            <td>radians</td>
          </tr>
        </tbody>
      </table>
    )
  )
}

export const runParams = signal({} as any)
