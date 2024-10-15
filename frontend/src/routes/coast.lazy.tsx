import {createLazyFileRoute} from '@tanstack/react-router'
import {CoastsMap} from '../components/coast.map'

export const Route = createLazyFileRoute('/coast')({
  component: CoastsMap,
})
