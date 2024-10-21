import {gridMatrix} from '../stores/grid'

type LocationProps = {
  row: number
  column: number
}

export const Location = ({row, column}: LocationProps) => {
  const [lng, lat] = gridMatrix.value[row][column]
  return <>{formattedLngLat(lng, lat)}</>
}

export const formattedLngLat = (lng: number, lat: number) => {
  const lngStr = lng > 0 ? 'N' : 'S'
  const latStr = lat > 0 ? 'E' : 'W'
  return `${lng.toFixed(2)}°${lngStr}, ${lat.toFixed(2)}°${latStr}`
}
