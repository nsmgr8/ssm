import {Source} from 'react-map-gl/maplibre'
import {stormTrackGeoJSON} from '../stores/storm'
import {Layer} from 'react-map-gl'
import {currentStormGeoJSON} from '../stores/zeta'

export const Storm = () => {
  return (
    <>
      <Source id="storm-track" type="geojson" data={stormTrackGeoJSON.value}>
        <Layer id="storm-point" type="circle" paint={{'circle-color': 'white', 'circle-radius': 6}} />
        <Layer id="storm-lines" type="line" paint={{'line-color': 'pink'}} />
      </Source>
      <Source id="current-storm-source" type="geojson" data={currentStormGeoJSON.value}>
        <Layer id="current-storm-point" type="circle" paint={{'circle-color': 'blue', 'circle-radius': 12}} />
      </Source>
    </>
  )
}
