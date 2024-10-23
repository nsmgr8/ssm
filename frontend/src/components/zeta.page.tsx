import MapGL from 'react-map-gl/maplibre'
import {Storm} from './storm'
import DeckGL from '@deck.gl/react'
import {ZetaCard} from './zeta.card'
import {currentStormTime, currentZetaIdx, ZetaKey, zetaLayer, zetaMin, zetas} from '../stores/zeta'
import {MapViewState, PickingInfo, WebMercatorViewport} from '@deck.gl/core'
import {ContourLayer} from '@deck.gl/aggregation-layers'
import {Card} from './card'
import {Location} from './location'
import {useState} from 'react'
import { formattedLngLat } from '../utils/formats'

export const ZetaMapPage = () => (
  <>
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
  </>
)

type ZetaMapProps = {
  layer?: ContourLayer<[number, number, number]>
  zoom?: number
  type: ZetaKey
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
  return (
    <>
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={[layer]}
        getTooltip={getTooltip}
        style={{mixBlendMode: 'lighten'}}
        onAfterRender={onAfterRender}
      >
        <MapGL reuseMaps mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json">
          {type !== 'tide' && <Storm />}
        </MapGL>
      </DeckGL>
      <InfoCard type={type} />
    </>
  )
}

const getTooltip = (info: PickingInfo) => {
  if (!info.object) {
    return null
  }
  const {threshold} = info.object.contour
  const [lng, lat] = info.coordinate || []
  const [minVal, maxVal] = threshold.map((x: number) => x + zetaMin.value)
  return {
    html: `
      <div>Sea level from ${minVal.toFixed(2)}m to ${maxVal.toFixed(2)}m</div>
      <div>Location: ${formattedLngLat(lng, lat)}</div>
    `,
  }
}

type InfoCardProps = {
  type: ZetaKey
}
const label = (type: ZetaKey) =>
  ({
    both: 'Surge and Tide',
    surge: 'Surge only',
    tide: 'Tide only',
  })[type]
const InfoCard = ({type}: InfoCardProps) => {
  let maxVal = -10000
  let maxLoc: number[] = [0, 0]
  zetas.value[type][currentZetaIdx.value]?.data.forEach(([i, j, v]) => {
    if (v > maxVal) {
      maxVal = v
      maxLoc = [i, j]
    }
  })
  return (
    <Card style={{position: 'absolute', right: 10, left: ''}}>
      <table>
        <caption style={{display: 'block'}}>{label(type)}</caption>
        {zetas.value[type].length > 0 && (
          <tbody>
            <tr>
              <th style={{textAlign: 'right'}}>Time</th>
              <td>
                {currentStormTime.value.toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </td>
            </tr>
            <tr>
              <th style={{textAlign: 'right'}}>Peak value</th>
              <td>{maxVal.toFixed(2)} meters</td>
            </tr>
            <tr>
              <th style={{textAlign: 'right'}}>Peak at</th>
              <td>
                <Location row={maxLoc[0]} column={maxLoc[1]} />
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </Card>
  )
}
