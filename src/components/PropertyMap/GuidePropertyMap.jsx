import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
const HAS_MAPBOX_TOKEN = MAPBOX_TOKEN && MAPBOX_TOKEN !== 'YOUR_MAPBOX_PUBLIC_TOKEN'
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

function hasCoordinates(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
}

export default function GuidePropertyMap({ latitude, longitude, propertyName }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN || !hasCoordinates(latitude, longitude) || !containerRef.current) return undefined

    mapboxgl.accessToken = MAPBOX_TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [longitude, latitude],
      zoom: 11.5,
      attributionControl: false,
    })
    mapRef.current = map

    const markerElement = document.createElement('div')
    markerElement.className = 'guide-map-marker'
    markerElement.setAttribute('aria-label', propertyName)
    markerRef.current = new mapboxgl.Marker({ element: markerElement })
      .setLngLat([longitude, latitude])
      .addTo(map)

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!hasCoordinates(latitude, longitude) || !mapRef.current) return

    mapRef.current.flyTo({ center: [longitude, latitude], essential: true, duration: 900 })
    markerRef.current?.setLngLat([longitude, latitude])
  }, [latitude, longitude])

  if (!HAS_MAPBOX_TOKEN) {
    return <div className="presentation__map-message">Add VITE_MAPBOX_ACCESS_TOKEN to .env.local to load the map.</div>
  }

  if (!hasCoordinates(latitude, longitude)) {
    return <div className="presentation__map-message">Exact property coordinates will appear here when configured.</div>
  }

  return <div ref={containerRef} className="guide-property-map" aria-label={`${propertyName} location map`} />
}
