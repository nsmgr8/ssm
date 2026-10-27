import {featureCollection, nearestPoint, point} from '@turf/turf'
import {computed, signal} from '@preact/signals-react'
import {ports} from '../assets/ports.json'
import {gridMatrix, selectedPoint} from './grid'

const features = ports.map((p) => point([p.lon, p.lat], {name: p.name}))
export const stationsGeoJSON = featureCollection(features, {id: 'observation-stations'})

export const stationName = signal('')

export const nearestStation = computed(() => {
  const {row, column} = selectedPoint.value
  if (row > -1 && column > -1) {
    const [lon, lat] = gridMatrix.value[row]?.[column]
    return nearestPoint(point([lon, lat]), stationsGeoJSON)
  }
  return {}
})

export const selectedStation = signal({})

export const setSelectedStation = (idx: number) => {
  selectedStation.value = features[idx]
}
