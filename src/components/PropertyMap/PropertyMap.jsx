import { useCallback, useMemo, useRef, useState } from 'react'
import Map, { Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

import { mapProperties } from '../../data/properties'
import {
  HYDERABAD_VIEW,
  SOUTH_HYDERABAD_VIEW,
  mapLocations,
  mapReferencePoints,
} from '../../data/locations'
import PropertyMarker from './PropertyMarker'
import LocationMarker from './LocationMarker'
import PropertyPanel from './PropertyPanel'
import LocationPanel from './LocationPanel'
import MapControls from './MapControls'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

/**
 * Interactive Hyderabad property map.
 * Exposes selection callbacks for a future ILA Guide integration.
 */
export default function PropertyMap({
  selectedProperty,
  selectedLocation,
  onPropertySelect,
  onLocationSelect,
  onClearSelection,
}) {
  const mapRef = useRef(null)
  const [viewState, setViewState] = useState(HYDERABAD_VIEW)

  const flyTo = useCallback((longitude, latitude, zoom = 13) => {
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom,
      duration: 1200,
      essential: true,
    })
  }, [])

  const handlePropertySelect = useCallback(
    (property) => {
      onPropertySelect?.(property)
      const [lng, lat] = property.coordinates
      flyTo(lng, lat, 13.4)
    },
    [flyTo, onPropertySelect],
  )

  const handleLocationSelect = useCallback(
    (location) => {
      onLocationSelect?.(location)
      const [lng, lat] = location.coordinates
      flyTo(lng, lat, location.zoom ?? 12.2)
    },
    [flyTo, onLocationSelect],
  )

  const zoomBy = (delta) => {
    const map = mapRef.current
    if (!map) return
    map.easeTo({ zoom: map.getZoom() + delta, duration: 350 })
  }

  const referenceMarkers = useMemo(
    () =>
      mapReferencePoints.map((point) => (
        <Marker
          key={point.id}
          longitude={point.coordinates[0]}
          latitude={point.coordinates[1]}
          anchor="center"
          style={{ pointerEvents: 'none' }}
        >
          <span className="ref-label">{point.label}</span>
        </Marker>
      )),
    [],
  )

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_MAPBOX_PUBLIC_TOKEN') {
    return (
      <div className="map-shell map-shell--missing-token" role="status">
        <div className="map-token-message">
          <h3>Mapbox token required</h3>
          <p>
            Add your token to a <code>.env.local</code> file in the project root:
          </p>
          <pre>VITE_MAPBOX_ACCESS_TOKEN=YOUR_MAPBOX_PUBLIC_TOKEN</pre>
          <p>
            See <code>.env.example</code>. Restart <code>npm run dev</code> after
            saving. The rest of the site continues to work without it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="map-shell">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
        onClick={() => onClearSelection?.()}
      >
        {referenceMarkers}

        {mapLocations.map((location) => (
          <Marker
            key={location.id}
            longitude={location.coordinates[0]}
            latitude={location.coordinates[1]}
            anchor="center"
            style={{ zIndex: selectedLocation?.id === location.id ? 3 : 1 }}
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              handleLocationSelect(location)
            }}
          >
            <LocationMarker
              location={location}
              selected={selectedLocation?.id === location.id}
              onSelect={handleLocationSelect}
            />
          </Marker>
        ))}

        {mapProperties.map((property) => (
          <Marker
            key={property.id}
            longitude={property.coordinates[0]}
            latitude={property.coordinates[1]}
            anchor="bottom"
            style={{ zIndex: selectedProperty?.id === property.id ? 4 : 2 }}
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              handlePropertySelect(property)
            }}
          >
            <PropertyMarker
              property={property}
              selected={selectedProperty?.id === property.id}
              onSelect={handlePropertySelect}
            />
          </Marker>
        ))}
      </Map>

      <MapControls
        onZoomIn={() => zoomBy(0.8)}
        onZoomOut={() => zoomBy(-0.8)}
        onReset={() => {
          onClearSelection?.()
          mapRef.current?.flyTo({ ...HYDERABAD_VIEW, duration: 1100 })
        }}
        onSouthHyderabad={() => {
          const south = mapLocations.find((l) => l.id === 'south-hyderabad')
          if (south) handleLocationSelect(south)
          else mapRef.current?.flyTo({ ...SOUTH_HYDERABAD_VIEW, duration: 1100 })
        }}
      />

      <div className="map-panel-slot">
        {selectedProperty ? (
          <PropertyPanel
            property={selectedProperty}
            onClose={onClearSelection}
            onView={(property) => {
              // Hook for future detail page / ILA Guide
              onPropertySelect?.(property)
            }}
          />
        ) : null}

        {selectedLocation ? (
          <LocationPanel
            location={selectedLocation}
            onClose={onClearSelection}
            onExplore={(location) => {
              const match = mapProperties.find(
                (p) =>
                  p.location.toLowerCase() === location.name.toLowerCase() ||
                  location.id.includes(p.location.toLowerCase().replace(/\s+/g, '-')),
              )
              if (match) {
                handlePropertySelect(match)
                return
              }
              const [lng, lat] = location.coordinates
              onClearSelection?.()
              flyTo(lng, lat, Math.max((location.zoom ?? 12) - 0.4, 11))
            }}
          />
        ) : null}
      </div>

      <p className="map-demo-note">
        Markers use approximate demo coordinates for prototype exploration.
      </p>
    </div>
  )
}

