import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import './SatelliteBeforeAfter.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
const HAS_MAPBOX_TOKEN =
  Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== 'YOUR_MAPBOX_PUBLIC_TOKEN'
const MAP_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12'

const YEAR_ZOOM = {
  '2018': 11.6,
  '2020': 12.0,
  '2022': 12.5,
  '2025': 13.1,
  '2029': 13.4,
}

function buildHighlightCircle([lng, lat], radiusKm = 1.5, steps = 64) {
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

export default function SatelliteBeforeAfter({ property }) {
  const { coordinates, zoom, name, timeline, location } = property
  const mapRef = useRef(null)
  const [activeYear, setActiveYear] = useState(
    timeline.find((item) => item.year === '2025')?.year ?? timeline[0]?.year,
  )
  const [viewState, setViewState] = useState({
    longitude: coordinates[0],
    latitude: coordinates[1],
    zoom: YEAR_ZOOM[activeYear] ?? zoom ?? 12.6,
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

  const activeItem =
    timeline.find((item) => item.year === activeYear) ?? timeline[0]

  const flyToYear = useCallback(
    (year) => {
      mapRef.current?.flyTo({
        center: coordinates,
        zoom: YEAR_ZOOM[year] ?? zoom ?? 12.6,
        duration: 900,
        essential: true,
        padding: { top: 36, bottom: 56, left: 36, right: 36 },
      })
    },
    [coordinates, zoom],
  )

  useEffect(() => {
    const year =
      timeline.find((item) => item.year === '2025')?.year ?? timeline[0]?.year
    setActiveYear(year)
    flyToYear(year)
  }, [property.id, timeline, flyToYear])

  function selectYear(year) {
    setActiveYear(year)
    flyToYear(year)
  }

  return (
    <section className="pd-section pd-sat" aria-labelledby="pd-sat-title">
      <div className="pd__frame">
        <p className="pd-eyebrow">Location story</p>
        <h2 id="pd-sat-title" className="pd-heading">
          See how this location has transformed
        </h2>

        <div className="pd-sat__grid">
          <div className="pd-sat__map-pane">
            <div className="pd-sat__map-wrap">
              {HAS_MAPBOX_TOKEN ? (
                <Map
                  ref={mapRef}
                  mapboxAccessToken={MAPBOX_TOKEN}
                  {...viewState}
                  onMove={(event) => setViewState(event.viewState)}
                  onLoad={() => flyToYear(activeYear)}
                  mapStyle={MAP_STYLE}
                  style={{ width: '100%', height: '100%' }}
                  attributionControl={false}
                  reuseMaps
                >
                  <Source id="pd-sat-highlight" type="geojson" data={highlightGeoJson}>
                    <Layer
                      id="pd-sat-highlight-fill"
                      type="fill"
                      paint={{
                        'fill-color': '#C9A84C',
                        'fill-opacity': 0.2,
                      }}
                    />
                    <Layer
                      id="pd-sat-highlight-line"
                      type="line"
                      paint={{
                        'line-color': '#E2C97E',
                        'line-width': 2.25,
                        'line-opacity': 0.95,
                        'line-dasharray': [2, 1.4],
                      }}
                    />
                  </Source>

                  <Marker
                    longitude={coordinates[0]}
                    latitude={coordinates[1]}
                    anchor="bottom"
                  >
                    <div className="pd-sat__marker">
                      <span className="pd-sat__marker-dot" aria-hidden="true" />
                      <span className="pd-sat__marker-label">{name}</span>
                    </div>
                  </Marker>
                </Map>
              ) : (
                <div className="pd-sat__fallback" role="status">
                  Add <code>VITE_MAPBOX_ACCESS_TOKEN</code> to load the live map.
                </div>
              )}
            </div>

            <div className="pd-sat__pill" aria-live="polite">
              <div>
                <div className="pd-sat__pill-year">{activeItem?.year}</div>
                <div className="pd-sat__pill-tag">{location}</div>
              </div>
              <div className="pd-sat__pill-badge">Satellite</div>
            </div>
          </div>

          <ol className="pd-sat__timeline">
            {timeline.map((item) => {
              const isActive = item.year === activeYear
              return (
                <li key={item.year}>
                  <button
                    type="button"
                    className={`pd-sat__step${isActive ? ' is-active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => selectYear(item.year)}
                  >
                    <strong>{item.year}</strong>
                    <span>{item.text}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
