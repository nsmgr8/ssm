import {createLazyFileRoute} from '@tanstack/react-router'
import {ZetaMapPage} from '../components/zeta.page'

export const Route = createLazyFileRoute('/zeta')({
  component: ZetaMapPage,
})
