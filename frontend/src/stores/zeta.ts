import {ContourLayer, ContourLayerProps, HeatmapLayer} from '@deck.gl/aggregation-layers'
import {computed, signal} from '@preact/signals-react'
import {gridMatrix} from './grid'
import {point} from '@turf/turf'

type ZetaData = {
  data: [row: number, column: number, value: number][]
  storm_location: [lng: number, lat: number]
  time: number
}

export const zetas = signal<ZetaData[]>([])
export const currentZetaIdx = signal(0)
export const currentStorm = signal<[number, number]>([0, 0])

export const currentStormGeoJSON = computed(() => point(currentStorm.value))
export const zetaLayer = computed(() => {
  let data: any = []
  if (zetas.value.length > currentZetaIdx.value) {
    const zeta = zetas.value[currentZetaIdx.value]
    data = zeta.data
    currentStorm.value = zeta.storm_location
  } else {
    currentStorm.value = [0, 0]
    return []
  }
  // return [new HeatmapLayer({
  //     data,
  //     id: 'zeta-heatmap-layer',
  //     pickable: true,
  //     getPosition: d => gridMatrix.value[d[0]][d[1]],
  //     getWeight: d => d[2],
  //     radiusPixels: 30,
  //     intensity: 10,
  //     threshold: 0.01,
  //     aggregation: 'MEAN'
  //   })]
  return [
    new ContourLayer({
      data,
      id: 'zeta-contour',
      getPosition: (d) => gridMatrix.value[d[0]][d[1]],
      getWeight: (d) => d[2],
      pickable: true,
      aggregation: 'MEAN',
      updateTriggers: {
        getWeight: currentZetaIdx.value,
      },
      contours: BANDS,
      cellSize: 8000,
    }),
  ]
})

const BANDS: ContourLayerProps['contours'] = [
  {threshold: [-3, -2], color: [255, 255, 178]},
  {threshold: [-2, -1], color: [254, 204, 92]},
  {threshold: [-1, -0.1], color: [253, 141, 60]},
  {threshold: [-0.1, 0.1], color: [0, 0, 0, 0]},
  {threshold: [0.1, 1], color: [240, 59, 32]},
  {threshold: [1, 2], color: [189, 0, 38]},
  {threshold: [2, 3], color: [159, 0, 80]},
  {threshold: [3, 4], color: [159, 50, 80]},
  {threshold: [4, 5], color: [159, 100, 80]},
]
