import {ContourLayer, ContourLayerProps} from '@deck.gl/aggregation-layers'
import {computed, signal} from '@preact/signals-react'
import {gridMatrix} from './grid'
import {featureCollection, point} from '@turf/turf'
import {interpolateYlOrRd} from 'd3-scale-chromatic'

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
export type ZetaKey = keyof Zetas

const initialZeta = {both: [], surge: [], tide: []}
export const resetZeta = () => {
  zetas.value = initialZeta
  zetaMin.value = 10000
  zetaMax.value = -10000
  currentZetaIdx.value = 0
}

export const zetas = signal<Zetas>(initialZeta)
export const currentZetaIdx = signal(0)
export const zetaMin = signal(0)
export const zetaMax = signal(0)
export const zetaDt = signal(0)

export const stormStartedAt = signal(0)
export const currentStormTime = computed(
  () => new Date(stormStartedAt.value + currentZetaIdx.value * zetaDt.value * 1000)
)
export const currentStorm = computed(() =>
  zetas.value.both.length > currentZetaIdx.value ? zetas.value.both[currentZetaIdx.value].storm_location : []
)
export const currentStormGeoJSON = computed(() =>
  currentStorm.value.length === 2 ? point(currentStorm.value) : featureCollection([])
)
export const zetaLayer = computed(() => {
  const layers: any = {}
  ;(['both', 'surge', 'tide'] as ZetaKey[]).forEach((key) => {
    if (zetas.value[key].length > currentZetaIdx.value) {
      const {data} = zetas.value[key][currentZetaIdx.value]
      layers[key] = new ContourLayer({
        data,
        id: 'zeta-contour',
        getPosition: (d) => gridMatrix.value[d[0]][d[1]],
        getWeight: (d) => d[2] - zetaMin.value,
        pickable: true,
        aggregation: 'MEAN',
        contours: getBands(),
        cellSize: 17000,
      })
    }
  })
  return layers
})

export function getBands() {
  const nBands = 10
  const dVal = (zetaMax.value - zetaMin.value) / (nBands + 1)
  const BANDS: ContourLayerProps['contours'] = []
  for (let i = 0; i <= nBands; i++) {
    const low = i * dVal + 0.1
    const high = low + dVal
    const color = interpolateYlOrRd(i / nBands)
      .replace(/(rgb.)|([^\d]*$)/g, '')
      .split(',')
      .map((x) => +x)
    BANDS.push({threshold: [low, high], color})
  }
  return BANDS
}