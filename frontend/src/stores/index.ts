import {signal} from '@preact/signals-react'
import {resetCoasts} from './coast'
import {resetGrid} from './grid'
import {resetStorm} from './storm'
import {resetZeta} from './zeta'

export const resetAllStores = () => {
  resetGrid()
  resetStorm()
  resetCoasts()
  resetZeta()
}

export const showCard = signal(true)
