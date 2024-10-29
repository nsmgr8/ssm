import {distance} from '@turf/turf'
import {zetas, currentStormTime, RunType, currentStorm, peak} from '../stores/zeta'
import {formattedLngLat} from '../utils/formats'
import {Card} from './card'
import {stormName} from '../stores/storm'
import {ComponentProps} from 'react'
import {ContourBands} from './contour.bands'

export const InfoCard = ({type}: InfoCardProps) => {
  const {location, value} = peak.value[type]
  const hasData = zetas.value[type].length > 0 && currentStorm.value.length === 2
  return (
    <Card style={{position: 'absolute', right: 10, left: ''}}>
      <table style={{borderCollapse: 'collapse'}}>
        <caption style={{fontWeight: 'bold', borderBottom: '1px solid black', textWrap: 'nowrap'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', gap: 10}}>
            <div>{type === 'tide' ? '' : stormName.value}</div>
            <div>{label(type)}</div>
          </div>
        </caption>
        {hasData && (
          <>
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
                <TableCell>{formattedLngLat(location)}</TableCell>
              </TableRow>
              {type !== 'tide' && (
                <>
                  <TableRow>
                    <TableCellHeading>Storm center</TableCellHeading>
                    <TableCell>{formattedLngLat(currentStorm.value)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCellHeading>Storm distance</TableCellHeading>
                    <TableCell>{distance(location, currentStorm.value).toFixed(2)} km</TableCell>
                  </TableRow>
                </>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td style={{padding: 0}} colSpan={2}>
                  <ContourBands />
                </td>
              </tr>
            </tfoot>
          </>
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
