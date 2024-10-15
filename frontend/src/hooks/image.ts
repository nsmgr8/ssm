import {useEffect} from 'react'
import {useMap} from 'react-map-gl/maplibre'

type UseMapImageOptions = {
  url: string
  name: string
}

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
