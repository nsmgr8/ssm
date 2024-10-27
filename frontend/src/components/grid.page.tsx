import {MapProvider} from 'react-map-gl'
import {ConfigCard} from './grid.config.card'
import {GridStormMap} from './grid.storm.map'

export const GridPage = () => (
  <MapProvider>
    <GridStormMap />
    <ConfigCard />
  </MapProvider>
)
