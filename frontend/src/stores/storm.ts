import {computed, signal} from '@preact/signals-react'
import {featureCollection, lineString, point} from '@turf/turf'

export type StormData = {
  name: string
  max_wind_speed: number
  max_radius: number
  track: {
    time: string
    latitude: number
    longitude: number
  }[]
}

export const stormData = signal({} as StormData)
export const stormTrackGeoJSON = computed(() => {
  const {track = []} = stormData.value
  const features: any[] = track.map((p) => point([p.longitude, p.latitude], {time: p.time}))
  for (let i = 1; i < track.length; i++) {
    const p1 = [track[i - 1].longitude, track[i - 1].latitude]
    const p2 = [track[i].longitude, track[i].latitude]
    features.push(lineString([p1, p2]))
  }
  return featureCollection(features, {id: 'storm-track'})
})