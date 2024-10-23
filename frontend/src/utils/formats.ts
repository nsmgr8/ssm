export const formattedLngLat = (lng: number, lat: number) => {
  const lngStr = lng > 0 ? 'N' : 'S'
  const latStr = lat > 0 ? 'E' : 'W'
  return `${lng.toFixed(2)}°${lngStr}, ${lat.toFixed(2)}°${latStr}`
}
