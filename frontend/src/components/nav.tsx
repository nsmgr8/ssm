import {Link} from '@tanstack/react-router'
import {Card} from './card'

export const NavCard = () => (
  <Card style={{bottom: 10, top: '', display: 'flex', gap: '10px'}}>
    <Link to="/">Grid</Link>
    <Link to="/coast">Coast timeseries</Link>
    <Link to="/zeta">Contour</Link>
  </Card>
)
