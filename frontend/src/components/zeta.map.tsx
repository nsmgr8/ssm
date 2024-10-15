import MapGL, {MapLayerMouseEvent} from 'react-map-gl/maplibre'
import {Grid} from './grid'
import {selectedPoint} from '../stores/grid'
import {Storm} from './storm'
import DeckGL from '@deck.gl/react'
import {ZetaCard} from './zeta.card'
import {zetaLayer} from '../stores/zeta'
import {PickingInfo} from '@deck.gl/core'

export const ZetaMap = () => (
  <>
    <DeckGL
      initialViewState={{
        longitude: 90,
        latitude: 20.5,
        zoom: 7,
      }}
      controller={true}
      layers={zetaLayer.value}
      getTooltip={getTooltip}
      style={{mixBlendMode: 'lighten'}}
    >
      <MapGL
        reuseMaps
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={['sea', 'coast', 'land']}
        keyboard={false}
      >
        <Grid />
        <Storm />
      </MapGL>
    </DeckGL>
    <ZetaCard />
  </>
)

const getTooltip = (info: PickingInfo) => {
  if (!info.object) {
    return null
  }
  // const date = new Date(Date.UTC(2020, 0, 20) + week * MS_PER_WEEK);
  const {threshold} = info.object.contour
  return `${threshold}`
}
