import MapGL, {MapLayerMouseEvent} from 'react-map-gl/maplibre'
import {Grid} from './grid'
import {ConfigCard} from './config.card'
import {selectedPoint} from '../stores/grid'
import {Storm} from './storm'

export const GridMap = () => (
  <>
    <MapGL
      reuseMaps
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 1,
      }}
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      interactiveLayerIds={['sea', 'coast', 'land']}
      onMouseMove={onHover}
      onClick={selectPoint}
      keyboard={false}
    >
      <Grid />
      <Storm />
    </MapGL>
    <ConfigCard />
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
