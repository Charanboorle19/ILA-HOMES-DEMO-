import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import InfraIcon from './InfraIcon'
import './Connectivity.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
const HAS_MAPBOX_TOKEN =
  Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== 'YOUR_MAPBOX_PUBLIC_TOKEN'
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11'

const OFFSETS = {
  metro: [-0.018, 0.022],
  school: [0.028, 0.016],
  it: [0.032, -0.014],
  hospital: [0.01, -0.026],
  road: [-0.03, 0.008],
  orr: [-0.03, 0.008],
}

function getCoords(origin, item) {
  const [lng, lat] = origin
  const [dLng, dLat] = OFFSETS[item.id] ?? OFFSETS[item.icon] ?? [0.02, 0.01]
  return [lng + dLng, lat + dLat]
}

function buildHighlightCircle([lng, lat], radiusKm = 1.6, steps = 64) {
  const coordinates = []
  const latRad = (lat * Math.PI) / 180
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2
    const dLat = (radiusKm / 110.57) * Math.sin(angle)
    const dLng = (radiusKm / (111.32 * Math.cos(latRad))) * Math.cos(angle)
    coordinates.push([lng + dLng, lat + dLat])
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coordinates] },
  }
}

function buildOverlay(origin, items, activeId) {
  const points = []
  const lines = []

  items.forEach((item) => {
    const coordinates = getCoords(origin, item)
    const isActive = item.id === activeId
    points.push({
      type: 'Feature',
      properties: {
        id: item.id,
        active: isActive ? 1 : 0,
      },
      geometry: { type: 'Point', coordinates },
    })
    lines.push({
      type: 'Feature',
      properties: {
        id: `${item.id}-link`,
        active: isActive ? 1 : 0,
      },
      geometry: {
        type: 'LineString',
        coordinates: [origin, coordinates],
      },
    })
  })

  return {
    points: { type: 'FeatureCollection', features: points },
    lines: { type: 'FeatureCollection', features: lines },
  }
}

export default function Connectivity({ property }) {
  const { connectivity, testimonial, coordinates, zoom, name } = property
  const mapRef = useRef(null)
  const [activeId, setActiveId] = useState(connectivity[0]?.id ?? null)
  const [viewState, setViewState] = useState({
    longitude: coordinates[0],
    latitude: coordinates[1],
    zoom: Math.max(zoom ?? 12.4, 12.2),
    pitch: 0,
    bearing: 0,
  })

  const highlightGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: [buildHighlightCircle(coordinates)],
    }),
    [coordinates],
  )

  const overlay = useMemo(
    () => buildOverlay(coordinates, connectivity, activeId),
    [coordinates, connectivity, activeId],
  )

  const activeItem = connectivity.find((item) => item.id === activeId) ?? connectivity[0]

  const flyTo = useCallback(() => {
    mapRef.current?.flyTo({
      center: coordinates,
      zoom: Math.max(zoom ?? 12.4, 12.2),
      duration: 900,
      essential: true,
      padding: { top: 40, bottom: 80, left: 36, right: 36 },
    })
  }, [coordinates, zoom])

  useEffect(() => {
    flyTo()
    setActiveId(connectivity[0]?.id ?? null)
  }, [property.id, connectivity, flyTo])

  return (
    <section className="pd-connect" aria-labelledby="pd-connect-title">
      <div className="pd-connect__shell">
        <aside className="pd-connect__side">
          <p className="pd-connect__eyebrow">Connectivity</p>
          <h2 id="pd-connect-title" className="pd-connect__heading">
            Well connected.
            <br />
            Better living.
          </h2>
          <p className="pd-connect__lede">
            Select a landmark to highlight it on the map — distances from this
            layout to everyday destinations that matter.
          </p>

          <ul className="pd-connect__list" role="list">
            {connectivity.map((item) => {
              const isActive = item.id === activeId
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`pd-connect__item${isActive ? ' is-active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => setActiveId(item.id)}
                  >
                    <span className="pd-connect__icon" aria-hidden="true">
                      <InfraIcon name={item.icon} className="pd-connect__svg" />
                    </span>
                    <span className="pd-connect__item-copy">
                      <strong>{item.label}</strong>
                      <span>Tap to highlight on map</span>
                    </span>
                    <span className="pd-connect__item-distance">{item.distance}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <blockquote className="pd-connect__quote">
            <p>“{testimonial.quote}”</p>
            <footer>
              <cite>{testimonial.name}</cite>
              <span>{testimonial.location}</span>
            </footer>
          </blockquote>
        </aside>

        <div className="pd-connect__map-pane">
          <div className="pd-connect__map-wrap">
            {HAS_MAPBOX_TOKEN ? (
              <Map
                ref={mapRef}
                mapboxAccessToken={MAPBOX_TOKEN}
                {...viewState}
                onMove={(event) => setViewState(event.viewState)}
                onLoad={flyTo}
                mapStyle={MAP_STYLE}
                style={{ width: '100%', height: '100%' }}
                attributionControl={false}
                reuseMaps
              >
                <Source id="pd-connect-highlight" type="geojson" data={highlightGeoJson}>
                  <Layer
                    id="pd-connect-highlight-fill"
                    type="fill"
                    paint={{
                      'fill-color': '#C9A84C',
                      'fill-opacity': 0.18,
                    }}
                  />
                  <Layer
                    id="pd-connect-highlight-line"
                    type="line"
                    paint={{
                      'line-color': '#C9A84C',
                      'line-width': 2.25,
                      'line-opacity': 0.95,
                      'line-dasharray': [2, 1.4],
                    }}
                  />
                </Source>

                <Source id="pd-connect-links" type="geojson" data={overlay.lines}>
                  <Layer
                    id="pd-connect-links-line"
                    type="line"
                    paint={{
                      'line-color': [
                        'case',
                        ['==', ['get', 'active'], 1],
                        '#E2C97E',
                        '#C9A84C',
                      ],
                      'line-width': [
                        'case',
                        ['==', ['get', 'active'], 1],
                        2.2,
                        1.2,
                      ],
                      'line-opacity': [
                        'case',
                        ['==', ['get', 'active'], 1],
                        0.9,
                        0.35,
                      ],
                      'line-dasharray': [1.5, 1.5],
                    }}
                  />
                </Source>

                <Source id="pd-connect-points" type="geojson" data={overlay.points}>
                  <Layer
                    id="pd-connect-points-glow"
                    type="circle"
                    paint={{
                      'circle-radius': [
                        'case',
                        ['==', ['get', 'active'], 1],
                        22,
                        14,
                      ],
                      'circle-color': '#C9A84C',
                      'circle-opacity': [
                        'case',
                        ['==', ['get', 'active'], 1],
                        0.28,
                        0.12,
                      ],
                    }}
                  />
                  <Layer
                    id="pd-connect-points-core"
                    type="circle"
                    paint={{
                      'circle-radius': [
                        'case',
                        ['==', ['get', 'active'], 1],
                        7,
                        5,
                      ],
                      'circle-color': '#C9A84C',
                      'circle-stroke-width': 2,
                      'circle-stroke-color': '#0f1114',
                    }}
                  />
                </Source>

                <Marker
                  longitude={coordinates[0]}
                  latitude={coordinates[1]}
                  anchor="bottom"
                >
                  <div className="pd-connect__marker">
                    <span className="pd-connect__marker-dot" aria-hidden="true" />
                    <span className="pd-connect__marker-label">{name}</span>
                  </div>
                </Marker>

                {connectivity.map((item) => {
                  const [longitude, latitude] = getCoords(coordinates, item)
                  const isActive = item.id === activeId
                  return (
                    <Marker
                      key={item.id}
                      longitude={longitude}
                      latitude={latitude}
                      anchor="bottom"
                      onClick={(event) => {
                        event.originalEvent.stopPropagation()
                        setActiveId(item.id)
                      }}
                    >
                      <button
                        type="button"
                        className={`pd-connect__pin${isActive ? ' is-active' : ''}`}
                        aria-label={`Highlight ${item.label}`}
                        onClick={() => setActiveId(item.id)}
                      >
                        <span className="pd-connect__pin-icon" aria-hidden="true">
                          <InfraIcon name={item.icon} className="pd-connect__svg" />
                        </span>
                        <span className="pd-connect__pin-copy">
                          <strong>{item.label}</strong>
                          <span>{item.distance}</span>
                        </span>
                      </button>
                    </Marker>
                  )
                })}
              </Map>
            ) : (
              <div className="pd-connect__map-fallback" role="status">
                Add <code>VITE_MAPBOX_ACCESS_TOKEN</code> to load the live map.
              </div>
            )}
          </div>

          <div className="pd-connect__pill">
            <div>
              <div className="pd-connect__pill-name">
                {activeItem?.label ?? 'Connectivity'}
              </div>
              <div className="pd-connect__pill-tag">
                {activeItem ? `${activeItem.distance} from ${name}` : name}
              </div>
            </div>
            <div className="pd-connect__pill-badge">Highlighted</div>
          </div>
        </div>
      </div>
    </section>
  )
}
