import {createFileRoute} from '@tanstack/react-router'
import {GridMap} from '../components/grid.map'

export const Route = createFileRoute('/')({
  component: GridMap,
})
