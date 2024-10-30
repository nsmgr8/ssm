import * as colors from 'd3-scale-chromatic'
import {numBands} from '../stores/zeta'

export type ColorTuple = [number, number, number]
export type Threshold = [number, number]
type Interpolate = (x: number) => string

export const colorBands = (interpolate: Interpolate, min = 0, max = 1) => {
  const n = numBands.value
  const dx = (max - min) / (n + 1)
  const bands: {threshold: [number, number]; color: ColorTuple}[] = []
  for (let i = 0; i <= n; i++) {
    const low = i * dx + (i === 0 ? 1e-10 : 0)
    const high = low + dx
    const color = colorStr2Num(interpolate(i / n)) as ColorTuple
    bands.push({threshold: [low, high], color})
  }
  return bands
}

export const availableBands = {} as Record<string, Interpolate>
;(Object.keys(colors) as Array<keyof typeof colors>)
  .filter((x) => x.startsWith('interpolate'))
  .sort()
  .forEach((x) => (availableBands[x.replace('interpolate', '')] = colors[x] as Interpolate))

const colorStr2Num = (s: string) => {
  if (s.startsWith('rgb')) {
    return s
      .replace(/(rgb.)|([^\d]*$)/g, '')
      .split(',')
      .map((x) => +x)
  }
  if (s.startsWith('#')) {
    return [s.slice(1, 3), s.slice(3, 5), s.slice(5)].map((x) => +`0x${x}`)
  }
}
