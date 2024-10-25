export const formattedLngLat = (lng: number, lat: number) => {
  const lngStr = lng > 0 ? 'N' : 'S'
  const latStr = lat > 0 ? 'E' : 'W'
  return `${lng.toFixed(2)}°${lngStr}, ${lat.toFixed(2)}°${latStr}`
}

export const formatMilliseconds = (milliseconds: number) => {
  let seconds = milliseconds / 1000
  if (seconds <= 0) {
    return '00:00:00'
  }
  const hours = Math.floor(seconds / 3600)
  let rem = seconds % 3600
  const minutes = Math.floor(rem / 60)
  rem = rem % 60
  seconds = Math.floor(rem)
  return [hours, minutes, seconds].map((x) => `${x}`.padStart(2, '0')).join(':')
}
