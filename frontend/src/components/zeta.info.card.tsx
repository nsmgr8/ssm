import {distance} from '@turf/turf'
import {zetas, currentStormTime, RunType, currentStorm, peak} from '../stores/zeta'
import {formattedLngLat} from '../utils/formats'
import {Card} from './card'
import {stormData} from '../stores/storm'
import {ComponentProps} from 'react'

export const InfoCard = ({type}: InfoCardProps) => {
  const {location, value} = peak.value[type]
  return (
    <Card style={{position: 'absolute', right: 10, left: ''}}>
      <table style={{borderCollapse: 'collapse'}}>
        <caption style={{fontWeight: 'bold', borderBottom: '1px solid black', textWrap: 'nowrap'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', gap: 10}}>
            <div>{type === 'tide' ? '' : stormData.value.name}</div>
            <div>{label(type)}</div>
          </div>
        </caption>
        {zetas.value[type].length > 0 && currentStorm.value.length === 2 && (
          <tbody>
            <TableRow>
              <TableCellHeading>Time</TableCellHeading>
              <TableCell>
                {currentStormTime.value.toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCellHeading>Peak value</TableCellHeading>
              <TableCell>{value.toFixed(2)} meters</TableCell>
            </TableRow>
            <TableRow>
              <TableCellHeading>Peak at</TableCellHeading>
              <TableCell>{formattedLngLat(location[0], location[1])}</TableCell>
            </TableRow>
            {type !== 'tide' && (
              <>
                <TableRow>
                  <TableCellHeading>Storm center</TableCellHeading>
                  <TableCell>{formattedLngLat(currentStorm.value[0], currentStorm.value[1])}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCellHeading>Storm distance</TableCellHeading>
                  <TableCell>{distance(location, currentStorm.value).toFixed(2)} km</TableCell>
                </TableRow>
              </>
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

const TableRow = ({children}: ComponentProps<'tr'>) => <tr style={{borderBottom: '1px solid #aaa'}}>{children}</tr>
const TableCellHeading = ({children}: ComponentProps<'th'>) => (
  <th style={{textAlign: 'right', borderRight: '1px solid #aaa', padding: '3px 5px'}}>{children}</th>
)
const TableCell = ({children}: ComponentProps<'td'>) => (
  <td style={{textAlign: 'right', padding: '3px 5px', fontFamily: 'monospace'}}>{children}</td>
)
