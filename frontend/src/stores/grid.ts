import {computed, effect, signal} from '@preact/signals-react'
import {makeGrid, makeGridGeoJSON} from '../utils/grid'
import {featureCollection, point} from '@turf/turf'

export const Modes = ['coast', 'land', 'sea', 'none'] as const
export type Mode = (typeof Modes)[number]
export const selectionMode = signal<Mode>('none')

export const selectedPoint = signal<{row: number; column: number}>({
  row: -1,
  column: -1,
})

export const showUVZ = signal(false)

export const gridFields = {
  m: {label: 'Number of rows (m)', default: 60},
  n: {label: 'Number of columns (n)', default: 61},
  dr: {label: 'Radial Interval (meters)', default: 10_000},
  e: {label: 'Ellipse eccentricity (0 <= e < 1)', default: 0.5},
  alpha: {label: 'Starting angle (degree)', default: -60},
  beta: {label: 'Stopping angle (degree)', default: 30},
  lng: {label: 'Origin longitude (degree)', default: 91.4},
  lat: {label: 'Origin latitude (degree)', default: 23},
} as const

export type GridConfig = {
  m: number
  n: number
  dr: number
  e: number
  alpha: number
  beta: number
  origin: {
    longitude: number
    latitude: number
  }
}

export type GridPoint = 0 | 1 | 2

export const gridConfig = signal<GridConfig>({
  m: 60,
  n: 61,
  dr: 10_000,
  e: 0.5,
  alpha: -60,
  beta: 30,
  origin: {
    longitude: 91.4,
    latitude: 23,
  },
})

export const gridMatrix = computed(() => makeGrid(gridConfig.value))
export const gridLinesGeoJSON = computed(() => makeGridGeoJSON(gridMatrix.value))
export const gridPoints = signal<GridPoint[][]>([])
export const gridPointsGeoJSON = computed(() => {
  const features = []
  for (let i = 0; i < gridConfig.value.m; i++) {
    for (let j = 0; j < gridConfig.value.n; j++) {
      features.push(
        point(gridMatrix.value[i][j], {
          row: i,
          column: j,
          type: pointNum2Str[gridPoints.value[i][j]],
          uvz: toUVZ(i, j),
          selected: selectedPoint.value.row === i && selectedPoint.value.column === j && 'selected',
        })
      )
    }
  }
  return featureCollection(features)
})

const even = (x: number) => x % 2 === 0
const odd = (x: number) => !even(x)

const toUVZ = (i: number, j: number) => {
  return even(i) && even(j) ? 'u' : odd(i) && odd(j) ? 'v' : odd(i) && even(j) ? 'z' : ''
}

const pointNum2Str = {
  0: 'land',
  1: 'sea',
  2: 'coast',
} as const

const pointStr2Num = {
  land: 0,
  sea: 1,
  coast: 2,
} as const

effect(() => {
  if (selectionMode.value === 'none') return
  const {row, column} = selectedPoint.value
  try {
    gridPoints.value[row][column] = pointStr2Num[selectionMode.value]
  } catch (e) {
    console.error(e)
  }
})

effect(() => {
  const points: GridPoint[][] = []
  const {m, n} = gridConfig.value
  for (let i = 0; i < m; i++) {
    points.push(Array(n).fill(0))
    for (let j = 0; j < n; j++) {
      points[i][j] = 1
    }
  }
  gridPoints.value = points
})

export async function setupGrid(config: any, grid: any) {
  gridConfig.value = config
  await new Promise((resolve) => setTimeout(resolve, 100))
  const points: GridPoint[][] = []
  for (let i = 0; i < config.m; i++) {
    points.push(Array(config.n).fill(0))
    for (let j = 0; j < config.n; j++) {
      points[i][j] = grid[i][j]
    }
  }
  gridPoints.value = points
}
