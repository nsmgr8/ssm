import {useEffect} from 'react'
import {Layer, Source, useMap} from 'react-map-gl/maplibre'
import {gridLinesGeoJSON, gridMatrix} from '../stores/grid'
import {gridDomain} from '../utils/grid'
import {useKeyboardSelection} from '../hooks/grid.select'

export const Grid = () => {
  const {current: map} = useMap()

  useEffect(() => {
    if (gridMatrix.value.length) {
      map?.fitBounds(gridDomain(gridMatrix.value))
    }
  }, [map])

  useKeyboardSelection()

  if (!gridLinesGeoJSON.value.type) return null
  return (
    <>
      <Source id="map-grid" type="geojson" data={gridLinesGeoJSON.value}>
        <Layer id="lines" type="line" paint={{'line-color': '#aaa'}} />
      </Source>
    </>
  )
}
