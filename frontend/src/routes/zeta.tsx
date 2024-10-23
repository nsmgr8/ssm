import {createFileRoute} from '@tanstack/react-router'
import {ZetaMapPage} from '../components/zeta.page'
import {resetZeta} from '../stores/zeta'

export const Route = createFileRoute('/zeta')({
  beforeLoad: resetZeta,
  component: ZetaMapPage,
})
