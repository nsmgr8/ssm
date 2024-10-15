import {computed, signal} from '@preact/signals-react'
import {selectedPoint} from './grid'

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
  } catch (e) {
    // console.error(e)
    return []
  }
})

export const coastLevelMin = signal(1000)
export const coastLevelMax = signal(-1000)
