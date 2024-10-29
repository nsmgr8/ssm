import MapGL, {MapLayerMouseEvent} from 'react-map-gl/maplibre'
import {Grid} from './grid'
import {Storm} from './storm'
import {selectedPoint} from '../stores/grid'
import {hoverLocation} from '../stores'

const cartostyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const osmstyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm', // This must match the source key above
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any
const dark = true
const style = dark ? cartostyle : osmstyle

export const GridStormMap = ({coastOnly = false}) => (
  <MapGL
    reuseMaps
    initialViewState={{
      longitude: 0,
      latitude: 0,
      zoom: 1,
    }}
    mapStyle={style}
    interactiveLayerIds={['sea', 'coast', 'land']}
    onMouseMove={onHover}
    onClick={selectPoint}
    keyboard={false}
  >
    <Grid coastOnly={coastOnly} />
    <Storm />
  </MapGL>
)

const onHover = ({lngLat: {lng, lat}, features, target}: MapLayerMouseEvent) => {
  hoverLocation.value = [lng, lat]
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
