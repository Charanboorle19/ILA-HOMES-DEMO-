import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import InfraIcon from './InfraIcon'
import './FutureNeighbourhoodMap.css'

const MAPBOX_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN
const HAS_MAPBOX_TOKEN =
  Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== 'YOUR_MAPBOX_PUBLIC_TOKEN'
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

/** Demo default — Gachibowli / HITEC City area */
const DEMO_USER = {
  label: 'Gachibowli (demo)',
  coordinates: [78.3489, 17.4401],
}

function formatKm(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

function haversineKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getInfraStatusClass(status) {
  const value = String(status).toLowerCase()
  if (value.includes('operational') || value.includes('existing')) return 'is-operational'
  if (value.includes('construction') || value.includes('active')) return 'is-construction'
  return 'is-planned'
}

function getInfraCoordinates(origin, item) {
  const [lng, lat] = origin
  const [dLng, dLat] = item.offset ?? [0, 0]
  return [lng + dLng, lat + dLat]
}

function buildHighlightCircle([lng, lat], radiusKm = 1.8, steps = 64) {
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

function buildInfraOverlay(origin, infrastructure) {
  const [originLng, originLat] = origin
  const points = []
  const lines = []

  infrastructure.forEach((item, index) => {
    const coordinates = getInfraCoordinates(origin, item)
    points.push({
      type: 'Feature',
      properties: {
        id: `${item.id}-${index}`,
        status: getInfraStatusClass(item.status),
      },
      geometry: { type: 'Point', coordinates },
    })
    lines.push({
      type: 'Feature',
      properties: { id: `${item.id}-link-${index}` },
      geometry: {
        type: 'LineString',
        coordinates: [[originLng, originLat], coordinates],
      },
    })
  })

  return {
    points: { type: 'FeatureCollection', features: points },
    lines: { type: 'FeatureCollection', features: lines },
  }
}

export default function FutureNeighbourhoodMap({ property }) {
  const mapRef = useRef(null)
  const [mode, setMode] = useState('today')
  const [nearbyMe, setNearbyMe] = useState(false)
  const [viewState, setViewState] = useState({
    longitude: property.coordinates[0],
    latitude: property.coordinates[1],
    zoom: property.zoom ?? 12.6,
    pitch: 0,
    bearing: 0,
  })

  const infrastructure =
    mode === 'today'
      ? property.neighbourhood.existing
      : property.neighbourhood.proposed

  const distanceFromYou = useMemo(
    () => haversineKm(DEMO_USER.coordinates, property.coordinates),
    [property.coordinates],
  )

  const infraWithDistance = useMemo(
    () =>
      infrastructure.map((item) => {
        const coords = getInfraCoordinates(property.coordinates, item)
        const fromYou = haversineKm(DEMO_USER.coordinates, coords)
        return {
          ...item,
          coordinates: coords,
          fromYouKm: fromYou,
          displayDistance: nearbyMe ? `${formatKm(fromYou)} from you` : item.distance,
        }
      }),
    [infrastructure, nearbyMe, property.coordinates],
  )

  const highlightGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: [buildHighlightCircle(property.coordinates)],
    }),
    [property.coordinates],
  )

  const infraOverlay = useMemo(
    () => buildInfraOverlay(property.coordinates, infrastructure),
    [property.coordinates, infrastructure],
  )

  const userLinkGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [DEMO_USER.coordinates, property.coordinates],
          },
        },
      ],
    }),
    [property.coordinates],
  )

  const flyToProperty = useCallback(() => {
    const [longitude, latitude] = property.coordinates
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: property.zoom ?? 12.6,
      duration: 900,
      essential: true,
      padding: { top: 48, bottom: 88, left: 40, right: 40 },
    })
  }, [property.coordinates, property.zoom])

  const flyToNearby = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const [uLng, uLat] = DEMO_USER.coordinates
    const [pLng, pLat] = property.coordinates
    const midLng = (uLng + pLng) / 2
    const midLat = (uLat + pLat) / 2
    const span = Math.max(
      Math.abs(uLng - pLng),
      Math.abs(uLat - pLat),
      0.04,
    )
    const zoom = Math.max(10.2, Math.min(12.2, 11.4 - Math.log2(span * 40)))
    map.flyTo({
      center: [midLng, midLat],
      zoom,
      duration: 1100,
      essential: true,
      padding: { top: 48, bottom: 88, left: 40, right: 40 },
    })
  }, [property.coordinates])

  useEffect(() => {
    if (nearbyMe) flyToNearby()
    else flyToProperty()
  }, [property.id, mode, nearbyMe, flyToProperty, flyToNearby])

  const handleMapLoad = useCallback(() => {
    if (nearbyMe) flyToNearby()
    else flyToProperty()
  }, [nearbyMe, flyToNearby, flyToProperty])

  function toggleNearbyMe() {
    setNearbyMe((prev) => !prev)
  }
  return (
    <section className="pd-future" aria-labelledby="pd-future-title">
      <div className="pd-future__shell">
          <aside className="pd-future__side">
            <p className="pd-eyebrow">Future neighbourhood</p>
            <h2 id="pd-future-title" className="pd-heading">
              Not just today.
              <br />
              A brighter 2029.
            </h2>
            <p className="pd-lede">
              Toggle between what already surrounds this plot and the
              infrastructure expected to reshape the belt over the next few years.
            </p>

            <div className="pd-future__controls">
              <div className="pd-future__toggle" role="group" aria-label="Map timeframe">
                <button
                  type="button"
                  className={mode === 'today' ? 'is-active' : ''}
                  onClick={() => setMode('today')}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={mode === '2029' ? 'is-active' : ''}
                  onClick={() => setMode('2029')}
                >
                  In 2029
                </button>
              </div>

              <button
                type="button"
                className={`pd-future__nearby${nearbyMe ? ' is-active' : ''}`}
                aria-pressed={nearbyMe}
                onClick={toggleNearbyMe}
              >
                Near by me
              </button>
            </div>

            {nearbyMe && (
              <div className="pd-future__nearby-card" aria-live="polite">
                <p className="pd-future__nearby-kicker">From your location</p>
                <p className="pd-future__nearby-distance">
                  {formatKm(distanceFromYou)} to this plot
                </p>
                <p className="pd-future__nearby-note">
                  Demo location: {DEMO_USER.label}
                </p>
              </div>
            )}

            <ul className="pd-future__infra-list">
              {infraWithDistance.map((item) => (
                <li key={`${mode}-${item.id}`}>
                  <span className="pd-future__infra-icon" aria-hidden="true">
                    <InfraIcon name={item.icon} className="pd-future__svg-icon" />
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <span className="pd-future__infra-meta">
                      {item.displayDistance} · {item.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <ul className="pd-future__legend">
              <li>
                <span className="pd-future__dot is-existing" /> Existing
              </li>
              <li>
                <span className="pd-future__dot is-construction" /> Under construction
              </li>
              <li>
                <span className="pd-future__dot is-proposed" /> Proposed
              </li>
            </ul>
          </aside>

          <div className="pd-future__map-pane">
            <div className="pd-future__map-wrap">
              {HAS_MAPBOX_TOKEN ? (
                <Map
                  ref={mapRef}
                  mapboxAccessToken={MAPBOX_TOKEN}
                  {...viewState}
                  onMove={(event) => setViewState(event.viewState)}
                  onLoad={handleMapLoad}
                  mapStyle={MAP_STYLE}
                  style={{ width: '100%', height: '100%' }}
                  attributionControl={false}
                  reuseMaps
                >
                  <Source id="pd-future-highlight" type="geojson" data={highlightGeoJson}>
                    <Layer
                      id="pd-future-highlight-fill"
                      type="fill"
                      paint={{
                        'fill-color': '#C9A84C',
                        'fill-opacity': 0.16,
                      }}
                    />
                    <Layer
                      id="pd-future-highlight-line"
                      type="line"
                      paint={{
                        'line-color': '#C9A84C',
                        'line-width': 2.25,
                        'line-opacity': 0.9,
                        'line-dasharray': [2, 1.4],
                      }}
                    />
                  </Source>

                  <Source id="pd-future-infra-links" type="geojson" data={infraOverlay.lines}>
                    <Layer
                      id="pd-future-infra-links-line"
                      type="line"
                      paint={{
                        'line-color': '#C9A84C',
                        'line-width': 1.4,
                        'line-opacity': 0.55,
                        'line-dasharray': [1.5, 1.5],
                      }}
                    />
                  </Source>

                  <Source id="pd-future-infra-points" type="geojson" data={infraOverlay.points}>
                    <Layer
                      id="pd-future-infra-points-glow"
                      type="circle"
                      paint={{
                        'circle-radius': 16,
                        'circle-color': [
                          'match',
                          ['get', 'status'],
                          'is-operational',
                          '#2D8C50',
                          'is-construction',
                          '#C9A84C',
                          '#3B6EB4',
                        ],
                        'circle-opacity': 0.16,
                      }}
                    />
                    <Layer
                      id="pd-future-infra-points-core"
                      type="circle"
                      paint={{
                        'circle-radius': 5,
                        'circle-color': [
                          'match',
                          ['get', 'status'],
                          'is-operational',
                          '#2D8C50',
                          'is-construction',
                          '#C9A84C',
                          '#3B6EB4',
                        ],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                      }}
                    />
                  </Source>

                  <Marker
                    longitude={property.coordinates[0]}
                    latitude={property.coordinates[1]}
                    anchor="bottom"
                  >
                    <div className="pd-future__marker">
                      <span className="pd-future__marker-dot" aria-hidden="true" />
                      <span className="pd-future__marker-label">{property.name}</span>
                    </div>
                  </Marker>

                  {nearbyMe && (
                    <>
                      <Source id="pd-future-user-link" type="geojson" data={userLinkGeoJson}>
                        <Layer
                          id="pd-future-user-link-line"
                          type="line"
                          paint={{
                            'line-color': '#3B6EB4',
                            'line-width': 2,
                            'line-opacity': 0.7,
                            'line-dasharray': [2, 1.5],
                          }}
                        />
                      </Source>
                      <Marker
                        longitude={DEMO_USER.coordinates[0]}
                        latitude={DEMO_USER.coordinates[1]}
                        anchor="bottom"
                      >
                        <div className="pd-future__marker pd-future__marker--you">
                          <span className="pd-future__marker-dot" aria-hidden="true" />
                          <span className="pd-future__marker-label">You · {DEMO_USER.label}</span>
                        </div>
                      </Marker>
                    </>
                  )}

                  {infraWithDistance.map((item) => {
                    const [longitude, latitude] = item.coordinates
                    return (
                      <Marker
                        key={`${mode}-${item.id}-label`}
                        longitude={longitude}
                        latitude={latitude}
                        anchor="bottom"
                        style={{ pointerEvents: 'none' }}
                      >
                        <div
                          className={`pd-future__infra-marker ${getInfraStatusClass(item.status)}`}
                        >
                          <span className="pd-future__infra-marker-icon" aria-hidden="true">
                            <InfraIcon name={item.icon} className="pd-future__svg-icon" />
                          </span>
                          <span className="pd-future__infra-marker-copy">
                            <span className="pd-future__infra-marker-label">{item.label}</span>
                            <span className="pd-future__infra-marker-status">
                              {item.displayDistance} · {item.status}
                            </span>
                          </span>
                        </div>
                      </Marker>
                    )
                  })}
                </Map>
              ) : (
                <div className="pd-future__map-fallback" role="status">
                  Add <code>MAPBOX_ACCESS_TOKEN</code> to load the live map.
                </div>
              )}
            </div>

            <div className="pd-future__pill">
              <div>
                <div className="pd-future__pill-name">{property.name}</div>
                <div className="pd-future__pill-tag">
                  {nearbyMe
                    ? `${formatKm(distanceFromYou)} from ${DEMO_USER.label}`
                    : mode === 'today'
                      ? 'Neighbourhood today'
                      : 'Projected 2029 context'}
                </div>
              </div>
              <div className="pd-future__pill-badge">{property.location.split(',')[0]}</div>
            </div>
          </div>
      </div>
    </section>
  )
}
