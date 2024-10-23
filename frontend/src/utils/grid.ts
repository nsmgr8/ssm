import {
  bbox,
  degreesToRadians,
  earthRadius,
  featureCollection,
  lineString,
  multiLineString,
  radiansToDegrees,
} from '@turf/turf'
import {GridConfig} from '../stores/grid'
import {LngLatBoundsLike} from 'react-map-gl/maplibre'

type GridRow = [number, number][]
type GridMatrix = GridRow[]

export const makeGrid = (data: GridConfig) => {
  if (data.alpha === undefined) return []
  const alpha = degreesToRadians(data.alpha)
  const beta = degreesToRadians(data.beta)
  const originLng = degreesToRadians(data.origin.longitude)
  const originLat = degreesToRadians(data.origin.latitude)
  const dtheta = Math.abs(alpha - beta) / (data.n - 1)
  const c = Math.sqrt(1 / (1 - data.e * data.e))
  const thetas = Array(data.n)
    .fill(0)
    .map((_, i) => alpha + i * dtheta)
  const rs = Array(data.m)
    .fill(0)
    .map((_, i) => i * data.dr)

  const grid: GridMatrix = []
  for (let i = 0; i < data.m; i++) {
    const row: GridRow = []
    grid.push(row)
    for (let j = 0; j < data.n; j++) {
      const [r, theta] = [rs[i], thetas[j]]
      const x = r * Math.cos(theta)
      const y = r * c * Math.sin(theta)
      const {lat} = lngLatFromDist(originLng, originLat, x, Math.PI)
      const {lng} = lngLatFromDist(originLng, originLat, y, Math.PI / 2)
      row.push([radiansToDegrees(lng), radiansToDegrees(lat)])
    }
  }
  return grid
}

const lngLatFromDist = (srcLng: number, srcLat: number, distance: number, bearing: number) => {
  const sin_lat = Math.sin(srcLat)
  const cos_lat = Math.cos(srcLat)
  const sin_rad = Math.sin(distance / earthRadius)
  const cos_rad = Math.cos(distance / earthRadius)
  const sin_theta = Math.sin(bearing)
  const cos_theta = Math.cos(bearing)
  const lat = Math.asin(sin_lat * cos_rad + cos_lat * sin_rad * cos_theta)
  const lng = srcLng + Math.atan2(sin_theta * sin_rad * cos_lat, cos_rad - sin_lat * Math.sin(lat))
  return {lng, lat}
}

export const gridDomain = (grid: GridMatrix) => bbox(multiLineString(grid)) as LngLatBoundsLike

export const makeGridGeoJSON = (grid: GridMatrix) => {
  const features = []
  if (grid.length) {
    for (let i = 0; i < grid.length; i++) {
      features.push(lineString(grid[i]))
    }
    for (let j = 0; j < grid[0].length; j++) {
      features.push(
        lineString(
          Array(grid.length)
            .fill(0)
            .map((_, i) => grid[i][j])
        )
      )
    }
  }
  return featureCollection(features, {id: 'elliptic-grid'})
}
