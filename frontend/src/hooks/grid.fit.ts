import {signal} from '@preact/signals-react'
import {useEffect} from 'react'

export const useFitToGrid = (fitMap: () => void) => {
  useEffect(() => {
    if (!_fitToGrid.value) return
    fitMap()
    setTimeout(() => (_fitToGrid.value = false), 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_fitToGrid.value, fitMap])
}

const _fitToGrid = signal(false)

export const fitToGrid = () => (_fitToGrid.value = true)
