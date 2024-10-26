import {gridMatrix} from '../stores/grid'
import {formattedLngLat} from '../utils/formats'

type LocationProps = {
  row: number
  column: number
}

export const Location = ({row, column}: LocationProps) => {
  return <>{formattedLngLat(gridMatrix.value[row][column])}</>
}
