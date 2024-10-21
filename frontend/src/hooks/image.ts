import {useEffect} from 'react'
import {useMap} from 'react-map-gl/maplibre'

export function useMapImage(url: string, name: string) {
  const {current: map} = useMap()
  useEffect(() => {
    if (map) {
      map.loadImage(url).then((image) => {
        if (!map.hasImage(name)) map.addImage(name, image.data)
      })
    }
  }, [map])
}
