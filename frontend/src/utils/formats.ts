export const formattedLngLat = ([lng, lat]: [number, number] | never[]) => {
  if (lng === undefined || lat === undefined) {
    return 'unknown'
  }
  const lngStr = lng > 0 ? `${lng.toFixed(2)}°E` : `${Math.abs(lng).toFixed(2)}°W`
  const latStr = lat > 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`
  return `${lngStr}, ${latStr}`
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

export const titleCase = (s: string) =>
  s
    .split(' ')
    .map((x) => x.charAt(0).toUpperCase() + x.substring(1))
    .join(' ')
