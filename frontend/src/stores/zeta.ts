import {ContourLayer} from '@deck.gl/aggregation-layers'
import {computed, signal} from '@preact/signals-react'
import {gridMatrix, resetGrid} from './grid'
import {featureCollection, point} from '@turf/turf'
import {currentStormLocation, resetStorm} from './storm'
import {availableBands, colorBands} from '../utils/colors'

type ZetaData = {
  data: [row: number, column: number, value: number][]
  storm_location: [lng: number, lat: number]
  time: number
}
type Zetas = {
  both: ZetaData[]
  surge: ZetaData[]
  tide: ZetaData[]
}
export type RunType = keyof Zetas
export const runTypes: RunType[] = ['both', 'surge', 'tide']

const initialZeta = {both: [], surge: [], tide: []}

export const resetZeta = () => {
  zetas.value = initialZeta
  zetaMin.value = 10000
  zetaMax.value = -10000
  zetaDt.value = 0
  currentZetaIdx.value = 0
  stormStartedAt.value = 0
  numBands.value = 10
  resetGrid()
  resetStorm()
}

export const zetas = signal<Zetas>(initialZeta)
export const currentZetaIdx = signal(0)
export const zetaMin = signal(0)
export const zetaMax = signal(0)
export const zetaDt = signal(0)
export const numBands = signal(10)

export const stormStartedAt = signal(0)
export const currentStormTime = computed(() => new Date(stormStartedAt.value + currentZetaIdx.value * zetaDt.value))
export const currentStorm = computed(() =>
  zetas.value.both.length > currentZetaIdx.value
    ? zetas.value.both[currentZetaIdx.value].storm_location
    : currentStormLocation.value
)
export const currentStormGeoJSON = computed(() =>
  currentStorm.value.length === 2 ? point(currentStorm.value) : featureCollection([])
)
export const zetaLayer = computed(() => {
  const layers = {} as Record<RunType, ContourLayer<[number, number, number]>>
  runTypes.forEach((key) => {
    if (zetas.value[key].length > currentZetaIdx.value) {
      const {data} = zetas.value[key][currentZetaIdx.value]
      layers[key] = new ContourLayer<[number, number, number]>({
        data,
        id: 'zeta-contour',
        getPosition: (d) => gridMatrix.value[d[0]][d[1]],
        getWeight: (d) => d[2] - zetaMin.value,
        pickable: true,
        aggregation: 'MEAN',
        contours: contourBands.value,
        cellSize: 17000,
      })
    }
  })
  return layers
})
export const peak = computed(() => {
  const result = {
    both: {location: [], value: -10000},
    surge: {location: [], value: -10000},
    tide: {location: [], value: -10000},
  } as Record<RunType, {location: [number, number] | never[]; value: number}>

  runTypes.forEach((key) => {
    if (zetas.value[key].length > currentZetaIdx.value) {
      const {data} = zetas.value[key][currentZetaIdx.value]
      let max = [-1, -1, -10000]
      data.forEach((v) => {
        if (v[2] > max[2]) max = v
      })
      result[key] = {location: gridMatrix.value[max[0]][max[1]], value: max[2]}
    }
  })
  return result
})

export const peakBand = signal(-1)

export const contourBands = computed(() =>
  colorBands(availableBands[currentBandColor.value], zetaMin.value, zetaMax.value)
)
export const currentBandColor = signal('Turbo')
