import {useEffect} from 'react'
import {selectedPoint, gridConfig} from '../stores/grid'

export const useKeyboardSelection = () => {
  useEffect(() => {
    const listener = (e: any) => {
      if (e.target.className !== 'maplibregl-canvas') return
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) return
      e.preventDefault()
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
      selectedPoint.value = {row, column}
    }
    document.addEventListener('keydown', listener)
    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [])
}
