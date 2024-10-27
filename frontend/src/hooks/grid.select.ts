import {useEffect} from 'react'
import {selectedPoint, gridConfig, gridPoints, gridMatrix} from '../stores/grid'
import {MapRef} from 'react-map-gl'

export const useKeyboardSelection = (map: MapRef, coastOnly = false) => {
  useEffect(() => {
    const listener = (coastOnly ? moveCoast : moveOne)(map)
    document.addEventListener('keydown', listener)
    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [coastOnly, map])
}

const canMove = (e: KeyboardEvent) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((e as any).target.className !== 'maplibregl-canvas') return false
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) return false
  e.preventDefault()
  e.stopPropagation()
  return true
}

const setPoint = (map: MapRef, row: number, column: number) => {
  selectedPoint.value = {row, column}
  map?.flyTo({center: gridMatrix.value[row][column]})
}

const moveOne = (map: MapRef) => (e: KeyboardEvent) => {
  if (!canMove(e)) return
  let {row, column} = selectedPoint.value
  const {m, n} = gridConfig.value
  if (row < 0 || column < 0) {
    return
  } else if (e.code === 'ArrowRight') {
    column += 1
    if (column >= n) column = 0
  } else if (e.code === 'ArrowLeft') {
    column -= 1
    if (column < 0) column = n - 1
  } else if (e.code === 'ArrowUp') {
    row -= 1
    if (row < 0) row = m - 1
  } else if (e.code === 'ArrowDown') {
    row += 1
    if (row >= m) row = 0
  }
  setPoint(map, row, column)
}

const moveCoast = (map: MapRef) => (e: KeyboardEvent) => {
  if (!canMove(e)) return
  let {row, column} = selectedPoint.value
  const {m, n} = gridConfig.value
  if (row < 0 || column < 0) {
    return
  } else if (e.code === 'ArrowRight') {
    for (let j = column + 1; j < n; j++) {
      if (gridPoints.value[row][j] === 2) {
        column = j
        break
      }
    }
  } else if (e.code === 'ArrowLeft') {
    for (let j = column - 1; j >= 0; j--) {
      if (gridPoints.value[row][j] === 2) {
        column = j
        break
      }
    }
  } else if (e.code === 'ArrowUp') {
    for (let i = row - 1; i >= 0; i--) {
      if (gridPoints.value[i][column] === 2) {
        row = i
        break
      }
    }
  } else if (e.code === 'ArrowDown') {
    for (let i = row + 1; i < m; i++) {
      if (gridPoints.value[i][column] === 2) {
        row = i
        break
      }
    }
  }
  setPoint(map, row, column)
}
