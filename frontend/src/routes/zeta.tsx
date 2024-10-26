import {createFileRoute} from '@tanstack/react-router'
import {ZetaMapPage} from '../components/zeta.page'

export const Route = createFileRoute('/zeta')({
  component: ZetaMapPage,
})
