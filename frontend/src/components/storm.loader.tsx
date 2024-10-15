import {StormData, stormData} from '../stores/storm'
import {LoadFile} from './load.file'
import {loadFile} from '../utils/file.load'

export const StormLoader = () => (
  <fieldset>
    <legend>Storm</legend>
    <LoadFile id="input-storm-file" label="Load storm" onChange={loadFile({init: initStorm, onLoad: onFileLoad})} />
    <table>
      <tbody>
        <tr>
          <th style={{textAlign: 'left'}}>Name</th>
          <td>{stormData.value.name}</td>
        </tr>
        <tr>
          <th style={{textAlign: 'left'}}>Wind speed (max)</th>
          <td>{stormData.value.max_wind_speed} km/h</td>
        </tr>
        <tr>
          <th style={{textAlign: 'left'}}>Radius (max)</th>
          <td>{stormData.value.max_radius} km</td>
        </tr>
      </tbody>
    </table>
  </fieldset>
)

const initStorm = () => (stormData.value = {} as StormData)

const onFileLoad = async (e: ProgressEvent<FileReader>) => {
  stormData.value = JSON.parse(e.target?.result as string)
}
