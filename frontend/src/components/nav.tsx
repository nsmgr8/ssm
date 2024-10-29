import {Link} from '@tanstack/react-router'
import {Card} from './card'
import {hoverLocation, showCard} from '../stores'
import {formattedLngLat} from '../utils/formats'

export const NavCard = () => (
  <Card style={{padding: '5px 10px', bottom: 10, top: '', display: 'flex', gap: '10px', borderRadius: '20px'}}>
    <ToggleCard />
    {showCard.value && (
      <>
        <Link to="/">Grid</Link>
        <Link to="/coast">Coast timeseries</Link>
        <Link to="/zeta">Contour</Link>
        {formattedLngLat(hoverLocation.value || [])}
      </>
    )}
  </Card>
)

const ToggleCard = () => {
  return (
    <button
      style={{padding: 0}}
      type="button"
      onClick={() => (showCard.value = !showCard.value)}
      title="Show/hide loader cards"
    >
      ☐
    </button>
  )
}
