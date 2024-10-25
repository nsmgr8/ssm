import {computed, signal} from '@preact/signals-react'
import {resetGrid, selectedPoint} from './grid'
import {resetStorm} from './storm'
import {RunType} from './zeta'

type xData = number
type yData = number
type DataItem = [xData, yData]
type RunItems = Record<RunType, DataItem[]>
type GridRow = number
type GridCol = number
export type Coasts = Record<GridRow, Record<GridCol, RunItems>>

export const coasts = signal({} as Coasts)

export const chartData = computed(
  () => coasts.value?.[selectedPoint.value.row]?.[selectedPoint.value.column] || {both: [], surge: [], tide: []}
)

export const coastLevelMin = signal(10000)
export const coastLevelMax = signal(-10000)

export const observed = signal([] as DataItem[])

export const resetCoasts = () => {
  coasts.value = {} as Coasts
  coastLevelMin.value = 10000
  coastLevelMax.value = -10000
  observed.value = []
  resetGrid()
  resetStorm()
}
