import {gridMatrix} from '../stores/grid'
import { formattedLngLat } from '../utils/formats'

type LocationProps = {
  row: number
  column: number
}

export const Location = ({row, column}: LocationProps) => {
  const [lng, lat] = gridMatrix.value[row][column]
  return <>{formattedLngLat(lng, lat)}</>
}
