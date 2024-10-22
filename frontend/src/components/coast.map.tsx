import MapGL, {MapLayerMouseEvent} from 'react-map-gl/maplibre'
import {Grid} from './grid'
import {selectedPoint} from '../stores/grid'
import {Storm} from './storm'
import {CoastsCard} from './coast.card'
import {CoastTimeSeries} from './coast.timeseries'

export const CoastsMap = () => (
  <>
    <div style={{display: 'flex'}}>
      <div style={{width: '50vw', height: '100vh'}}>
        <MapGL
          reuseMaps
          initialViewState={{longitude: 0, latitude: 0, zoom: 1}}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          interactiveLayerIds={['sea', 'coast', 'land']}
          onMouseMove={onHover}
          onClick={selectPoint}
          keyboard={false}
        >
          <Grid />
          <Storm />
        </MapGL>
      </div>
      <div style={{width: '50vw', height: '100vh'}}>
        <CoastTimeSeries />
      </div>
    </div>
    <CoastsCard />
  </>
)

const onHover = ({features, target}: MapLayerMouseEvent) => {
  if (features?.length === 1) {
    target.getCanvasContainer().style.cursor = 'pointer'
  } else {
    target.getCanvasContainer().style.cursor = 'grab'
  }
}

const selectPoint = ({features}: MapLayerMouseEvent) => {
  if (features?.length === 1) {
    const {row, column} = features[0].properties
    selectedPoint.value = {row, column}
  }
}