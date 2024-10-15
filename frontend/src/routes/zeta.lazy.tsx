import {createLazyFileRoute} from '@tanstack/react-router'
import {ZetaMap} from '../components/zeta.map'

export const Route = createLazyFileRoute('/zeta')({
  component: ZetaMap,
})
