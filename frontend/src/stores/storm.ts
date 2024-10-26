import {computed, signal} from '@preact/signals-react'
import {featureCollection, lineString, point} from '@turf/turf'
import {stormStartedAt} from './zeta'
import {titleCase} from '../utils/formats'

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

export const resetStorm = () => {
  stormData.value = {} as StormData
  stormLocations.value = []
  currentStormLocation.value = []
}

export const stormData = signal({} as StormData)
export const stormName = computed(() => {
  const {name = ''} = stormData.value
  return titleCase(name.replace('-', ' '))
})

export const stormLocations = signal([] as [number, number][])
export const currentStormLocation = signal([] as [number, number] | never[])

export const stormTrackGeoJSON = computed(() => {
  const {track = []} = stormData.value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const features: any[] = track.map((p) =>
    point([p.longitude, p.latitude], {time: +new Date(p.time) - stormStartedAt.value})
  )
  for (let i = 1; i < track.length; i++) {
    const p1 = [track[i - 1].longitude, track[i - 1].latitude]
    const p2 = [track[i].longitude, track[i].latitude]
    features.push(lineString([p1, p2]))
  }
  return featureCollection(features, {id: 'storm-track'})
})
