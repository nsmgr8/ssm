import {useEffect} from 'react'
import {Layer, Source, useMap} from 'react-map-gl/maplibre'
import {gridLinesGeoJSON, gridMatrix, gridPointsGeoJSON, showUVZ} from '../stores/grid'
import {gridDomain} from '../utils/grid'
import {useKeyboardSelection} from '../hooks/grid.select'

const emptyGeoJSON = {
  type: 'FeatureCollection',
  features: [],
}

export const Grid = () => {
  const {current: map} = useMap()

  useEffect(() => {
    if (gridMatrix.value.length) {
      map?.fitBounds(gridDomain(gridMatrix.value))
    }
  }, [gridMatrix.value])

  useKeyboardSelection()

  if (!gridLinesGeoJSON.value.type) return null
  return (
    <>
      <Source id="map-grid" type="geojson" data={gridLinesGeoJSON.value}>
        <Layer id="lines" type="line" paint={{'line-color': '#aaa'}} />
      </Source>
      <Source id="uvz-points" type="geojson" data={showUVZ.value ? gridPointsGeoJSON.value : emptyGeoJSON}>
        <Layer
          id="u-point"
          type="circle"
          paint={{'circle-color': 'orange', 'circle-radius': 3}}
          filter={['in', 'u', ['string', ['get', 'uvz']]]}
        />
        <Layer
          id="v-point"
          type="circle"
          paint={{'circle-color': 'yellow', 'circle-radius': 3}}
          filter={['in', 'v', ['string', ['get', 'uvz']]]}
        />
        <Layer
          id="z-point"
          type="circle"
          paint={{'circle-color': 'pink', 'circle-radius': 3}}
          filter={['in', 'z', ['string', ['get', 'uvz']]]}
        />
      </Source>
      <Source id="map-grid-points" type="geojson" data={showUVZ.value ? emptyGeoJSON : gridPointsGeoJSON.value}>
        <Layer
          id="selected-point"
          type="circle"
          paint={{'circle-color': '#aaf', 'circle-radius': 10}}
          filter={['in', 'selected', ['string', ['get', 'selected']]]}
        />
        <Layer
          id="sea"
          type="circle"
          paint={{'circle-color': '#333', 'circle-radius': 3}}
          filter={['in', 'sea', ['string', ['get', 'type']]]}
        />
        <Layer
          id="coast"
          type="circle"
          paint={{'circle-color': '#a33', 'circle-radius': 5}}
          filter={['in', 'coast', ['string', ['get', 'type']]]}
        />
        <Layer
          id="land"
          type="circle"
          paint={{'circle-color': '#aaa', 'circle-radius': 4}}
          filter={['in', 'land', ['string', ['get', 'type']]]}
        />
      </Source>
    </>
  )
}