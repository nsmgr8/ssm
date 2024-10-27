import {MapProvider} from 'react-map-gl'
import {CoastsCard} from './coast.card'
import {CoastTimeSeries} from './coast.timeseries'
import {GridStormMap} from './grid.storm.map'

export const CoastsPage = () => (
  <MapProvider>
    <div style={{display: 'flex'}}>
      <div style={{width: '50vw', height: '100vh'}}>
        <GridStormMap coastOnly={true} />
      </div>
      <div style={{width: '50vw', height: '100vh'}}>
        <CoastTimeSeries />
      </div>
    </div>
    <CoastsCard />
  </MapProvider>
)
