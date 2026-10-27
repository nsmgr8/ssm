import {Source} from 'react-map-gl/maplibre'
import {Layer} from 'react-map-gl'
import {nearestStation, selectedStation, stationsGeoJSON} from '../stores/stations'

export const Stations = () => {
  return (
    <>
      <Source id="observation-stations" type="geojson" data={stationsGeoJSON}>
        <Layer id="stations" type="circle" paint={{'circle-color': 'green', 'circle-radius': 3}} />
      </Source>
      {nearestStation.value.geometry && (
        <Source id="nearest-station" type="geojson" data={nearestStation.value}>
          <Layer id="nearest-station" type="circle" paint={{'circle-color': 'cyan', 'circle-radius': 5}} />
        </Source>
      )}
      {selectedStation.value.geometry && (
        <Source id="selected-station" type="geojson" data={selectedStation.value}>
          <Layer id="selected-station" type="circle" paint={{'circle-color': 'blue', 'circle-radius': 5}} />
        </Source>
      )}
    </>
  )
}
