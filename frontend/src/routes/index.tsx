import {createFileRoute} from '@tanstack/react-router'
import {GridPage} from '../components/grid.page'
import {resetGrid} from '../stores/grid'
import {resetStorm} from '../stores/storm'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    resetGrid()
    resetStorm()
  },
  component: GridPage,
})
