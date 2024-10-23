import {createFileRoute} from '@tanstack/react-router'
import {CoastsPage} from '../components/coast.page'
import {resetCoasts} from '../stores/coast'

export const Route = createFileRoute('/coast')({
  beforeLoad: resetCoasts,
  component: CoastsPage,
})
