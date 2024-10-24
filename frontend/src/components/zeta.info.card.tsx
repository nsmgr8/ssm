import {distance} from '@turf/turf'
import {zetas, currentStormTime, RunType, currentStorm, peak} from '../stores/zeta'
import {formattedLngLat} from '../utils/formats'
import {Card} from './card'
import {stormData} from '../stores/storm'

export const InfoCard = ({type}: InfoCardProps) => {
  const {location, value} = peak.value[type]
  return (
    <Card style={{position: 'absolute', right: 10, left: ''}}>
      <table>
        <caption style={{fontWeight: 'bold', borderBottom: '1px solid black'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>{type === 'tide' ? '' : stormData.value.name}</div>
            <div>{label(type)}</div>
          </div>
        </caption>
        {zetas.value[type].length > 0 && currentStorm.value.length === 2 && (
          <tbody>
            {type !== 'tide' && (
              <tr>
                <th style={{textAlign: 'right'}}>Storm center</th>
                <td>{formattedLngLat(currentStorm.value[0], currentStorm.value[1])}</td>
              </tr>
            )}
            <tr>
              <th style={{textAlign: 'right'}}>Time</th>
              <td>
                {currentStormTime.value.toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </td>
            </tr>
            <tr>
              <th style={{textAlign: 'right'}}>Peak value</th>
              <td>{value.toFixed(2)} meters</td>
            </tr>
            <tr>
              <th style={{textAlign: 'right'}}>Peak at</th>
              <td>{formattedLngLat(location[0], location[1])}</td>
            </tr>
            {type !== 'tide' && (
              <tr>
                <th style={{textAlign: 'right'}}>Storm distance</th>
                <td>{distance(location, currentStorm.value).toFixed(2)} km</td>
              </tr>
            )}
          </tbody>
        )}
      </table>
    </Card>
  )
}

type InfoCardProps = {
  type: RunType
}

const label = (type: RunType) =>
  ({
    both: 'Surge and Tide',
    surge: 'Surge only',
    tide: 'Tide only',
  })[type]
