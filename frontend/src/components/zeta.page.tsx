import MapGL, {Layer, MapGeoJSONFeature, MapProvider, Source, useMap} from 'react-map-gl/maplibre'
import {Storm} from './storm'
import DeckGL from '@deck.gl/react'
import {ZetaCard} from './zeta.card'
import {currentZetaIdx, peak, RunType, zetaDt, zetaLayer, zetaMin} from '../stores/zeta'
import {MapViewState, PickingInfo, WebMercatorViewport} from '@deck.gl/core'
import {ContourLayer} from '@deck.gl/aggregation-layers'
import {useCallback, useState} from 'react'
import {formattedLngLat} from '../utils/formats'
import {InfoCard} from './zeta.info.card'
import {featureCollection, point} from '@turf/turf'

export const ZetaMapPage = () => (
  <MapProvider>
    <div
      style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridGap: 1, position: 'relative', height: '100%'}}
    >
      <div style={{border: '1px solid black', position: 'relative', gridRow: 'span 2'}}>
        <ZetaMap layer={zetaLayer.value.both} type="both" />
      </div>
      <div style={{position: 'relative'}}>
        <ZetaMap layer={zetaLayer.value.surge} type="surge" zoom={6} />
      </div>
      <div style={{position: 'relative'}}>
        <ZetaMap layer={zetaLayer.value.tide} type="tide" zoom={6} />
      </div>
    </div>
    <ZetaCard />
  </MapProvider>
)

type ZetaMapProps = {
  layer?: ContourLayer<[number, number, number]>
  zoom?: number
  type: RunType
}

const ZetaMap = ({layer, type}: ZetaMapProps) => {
  const [initialViewState, setInitialViewState] = useState<MapViewState>({
    longitude: 0,
    latitude: 0,
    zoom: 1,
  })
  const [hasLoaded, setHasLoaded] = useState<boolean>(false)

  const onAfterRender = () => {
    if (hasLoaded && !layer?.isLoaded) {
      setHasLoaded(false)
    }
    if (!hasLoaded && layer?.isLoaded) {
      setHasLoaded(true)

      const viewport = layer.context.viewport as WebMercatorViewport
      const {longitude, latitude, zoom} = viewport.fitBounds(
        layer.getBounds() as [[number, number], [number, number]],
        {padding: 10}
      )
      setInitialViewState({longitude, latitude, zoom})
    }
  }

  const mapId = `zeta-map-${type}`
  const deckId = `zeta-deck-${type}`
  const {[mapId]: map} = useMap()
  const [isOnStorm, setIsOnStorm] = useState(false)

  const onStormPoint = useCallback(
    (callback: (feature: MapGeoJSONFeature) => void) =>
      ({x, y}: PickingInfo) => {
        if (!map || type === 'tide') return
        const [feature] = map.queryRenderedFeatures([x, y], {
          layers: ['storm-point'],
          filter: ['==', ['geometry-type'], 'Point'],
        })
        callback(feature)
      },
    [map, type]
  )

  const onHover = onStormPoint((feature) => {
    setIsOnStorm(!!feature)
  })

  const onClick = onStormPoint((feature) => {
    if (feature) {
      const {time} = feature.properties
      currentZetaIdx.value = time / zetaDt.value
    }
  })

  return (
    <>
      <DeckGL
        id={deckId}
        initialViewState={initialViewState}
        controller
        layers={[layer]}
        getTooltip={getTooltip}
        style={{mixBlendMode: 'lighten'}}
        onAfterRender={onAfterRender}
        onClick={onClick}
        onHover={onHover}
        getCursor={() => (isOnStorm ? 'pointer' : 'grab')}
      >
        <MapGL id={mapId} reuseMaps mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json">
          {type !== 'tide' && <Storm />}
          <PeakLocation type={type} />
        </MapGL>
      </DeckGL>
      <InfoCard type={type} />
    </>
  )
}

const PeakLocation = ({type}: {type: RunType}) => {
  const {location, value} = peak.value[type]
  const geojson = location.length === 2 ? point(location, {value}) : featureCollection([])
  return (
    <Source id="peak-location-source" type="geojson" data={geojson}>
      <Layer id="peak-location-layer" type="circle" paint={{'circle-color': 'white', 'circle-radius': 14}} />
    </Source>
  )
}

const getTooltip = (info: PickingInfo) => {
  if (!info.object) {
    return null
  }
  const {threshold} = info.object.contour
  const [minVal, maxVal] = threshold.map((x: number) => x + zetaMin.value)
  const coord = info.coordinate as unknown as [number, number]
  return {
    html: `
      <div>Sea level from ${minVal.toFixed(2)}m to ${maxVal.toFixed(2)}m</div>
      <div>Location: ${formattedLngLat(coord || [])}</div>
    `,
  }
}
