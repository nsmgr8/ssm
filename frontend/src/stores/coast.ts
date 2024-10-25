import {computed, signal} from '@preact/signals-react'
import {resetGrid, selectedPoint} from './grid'
import {resetStorm} from './storm'

type RowData = {
  time: number
  tide?: number
  surge?: number
  both?: number
  observed?: number
}
export type Coasts = Record<number, Record<number, RowData[]>>
export const coasts = signal({} as Coasts)

export const chartData = computed(() => {
  try {
    return coasts.value[selectedPoint.value.row][selectedPoint.value.column]
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return []
  }
})

export const coastLevelMin = signal(10000)
export const coastLevelMax = signal(-10000)

export const resetCoasts = () => {
  coasts.value = {}
  coastLevelMin.value = 10000
  coastLevelMax.value = -10000
  resetGrid()
  resetStorm()
}
