import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  mapLocations,
  mapReferencePoints,
  SOUTH_HYDERABAD_VIEW,
} from '../data/locations'
import './GrowthCorridors.css'

const MAPBOX_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN
const HAS_MAPBOX_TOKEN =
  Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== 'YOUR_MAPBOX_PUBLIC_TOKEN'
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'
const MOBILE_MAP_QUERY = '(max-width: 720px)'

function isMobileMapViewport() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_MAP_QUERY).matches
}

function applyCorridorMapInteractions(map, mobile) {
  if (!map) return

  if (mobile) {
    map.dragPan.disable()
    map.scrollZoom.disable()
    map.boxZoom.disable()
    map.dragRotate.disable()
    map.keyboard.disable()
    map.doubleClickZoom.disable()
    map.touchPitch.disable()
    map.touchZoomRotate.enable()
    map.touchZoomRotate.disableRotation()
    // pan-y: one finger scrolls the page; Mapbox still gets two-finger pinch zoom.
    map.getCanvas().style.touchAction = 'pan-y'
    const container = map.getCanvasContainer()
    if (container) container.style.touchAction = 'pan-y'
  } else {
    map.dragPan.enable()
    map.scrollZoom.enable()
    map.boxZoom.enable()
    map.dragRotate.enable()
    map.keyboard.enable()
    map.doubleClickZoom.enable()
    map.touchPitch.enable()
    map.touchZoomRotate.enable()
    map.touchZoomRotate.enableRotation()
    map.getCanvas().style.touchAction = ''
    const container = map.getCanvasContainer()
    if (container) container.style.touchAction = ''
  }
}

const CORRIDOR_CONTENT = [
  {
    id: 'south-hyderabad',
    name: 'South Hyderabad',
    tag: 'Growth epicentre',
    description:
      'The next Gachibowli. ORR and airport corridor infrastructure is already in place. The window to buy before prices reflect it is narrowing fast.',
    infrastructure: [
      {
        icon: '🚇',
        title: 'Metro expansion — Narsingi corridor',
        label: 'Metro · Narsingi',
        status: 'Govt. approved',
        offset: [-0.028, 0.018],
      },
      {
        icon: '🛣',
        title: 'ORR Phase 3 expansion',
        label: 'ORR Phase 3',
        status: 'Under construction',
        offset: [0.032, 0.012],
      },
      {
        icon: '🏫',
        title: 'TSREIS School — 800m from plots',
        label: 'TSREIS School',
        status: 'Planned 2026',
        offset: [0.01, -0.022],
      },
    ],
    stats: [
      { value: '28 min', label: 'To airport via ORR', gold: true },
      { value: 'Rising', label: 'Demand index', gold: false },
    ],
    pillTag: 'Growth epicentre · ORR corridor',
    badge: '28 min to airport',
  },
  {
    id: 'maheshwaram',
    name: 'Maheshwaram',
    tag: 'ORR · Srisailam highway',
    description:
      '3 km from ORR Exit 14. IT corridor expansion actively drawing residential demand. Land prices up 38% over 3 years.',
    infrastructure: [
      {
        icon: '🛣',
        title: 'ORR Exit 14 — Direct access',
        label: 'ORR Exit 14',
        status: 'Operational',
        offset: [0.03, 0.016],
      },
      {
        icon: '🏗',
        title: 'IT corridor expansion',
        label: 'IT corridor',
        status: 'Active development',
        offset: [-0.024, 0.01],
      },
      {
        icon: '🏫',
        title: 'International school zone',
        label: 'School zone',
        status: 'Planned 2026',
        offset: [0.008, -0.02],
      },
    ],
    stats: [
      { value: '38%', label: 'Price growth · 3yr', gold: true },
      { value: '3 km', label: 'To ORR Exit 14', gold: false },
    ],
    pillTag: 'ORR · Srisailam highway',
    badge: '38% growth · 3yr',
  },
  {
    id: 'thukkuguda',
    name: 'Thukkuguda',
    tag: 'ORR Exit 14 · Employment hub',
    description:
      'Just 1.5 km from ORR Exit 14. Infrastructure-led residential boom with strong employment hub proximity and rising buyer demand.',
    infrastructure: [
      {
        icon: '🛣',
        title: 'ORR Exit 14 — 1.5 km',
        label: 'ORR Exit 14',
        status: 'Operational',
        offset: [-0.022, 0.014],
      },
      {
        icon: '🏗',
        title: 'Residential township',
        label: 'Township',
        status: 'Under construction',
        offset: [0.026, 0.008],
      },
      {
        icon: '🚇',
        title: 'Proposed metro connectivity',
        label: 'Proposed metro',
        status: 'Planned',
        offset: [0.006, -0.02],
      },
    ],
    stats: [
      { value: '1.5 km', label: 'To ORR Exit 14', gold: true },
      { value: 'High', label: 'Demand index', gold: false },
    ],
    pillTag: 'ORR Exit 14 · Employment hub',
    badge: '1.5 km to ORR',
  },
  {
    id: 'mansanpally',
    name: 'Mansanpally',
    tag: 'Srisailam highway · Value zone',
    description:
      'Strong appreciation at competitive entry pricing. Industrial and residential mix driving consistent long-term growth along the Srisailam corridor.',
    infrastructure: [
      {
        icon: '🛣',
        title: 'Srisailam Highway — Direct access',
        label: 'Srisailam Hwy',
        status: 'Operational',
        offset: [0.024, 0.014],
      },
      {
        icon: '🏗',
        title: 'Industrial zone development',
        label: 'Industrial zone',
        status: 'Active',
        offset: [-0.026, 0.006],
      },
      {
        icon: '🏠',
        title: 'Residential layout expansion',
        label: 'Layouts',
        status: 'Under construction',
        offset: [0.004, -0.02],
      },
    ],
    stats: [
      { value: '₹21K', label: 'Entry price / sq yd', gold: true },
      { value: 'Rising', label: 'Appreciation', gold: false },
    ],
    pillTag: 'Srisailam highway · Value zone',
    badge: '₹21K entry price',
  },
  {
    id: 'future-city',
    name: 'Future City',
    tag: 'Master planned · Airport corridor',
    description:
      'Government master plan active. 1.5 million residents projected. Long-horizon planning zones designed for the next phase of Hyderabad’s expansion.',
    infrastructure: [
      {
        icon: '🏙',
        title: 'Government master plan',
        label: 'Master plan',
        status: 'Active',
        offset: [-0.02, 0.016],
      },
      {
        icon: '✈',
        title: 'Airport corridor — 20 min via ORR',
        label: 'Airport corridor',
        status: 'Operational',
        offset: [0.03, 0.004],
      },
      {
        icon: '🚇',
        title: 'Proposed metro link',
        label: 'Metro link',
        status: 'Planned 2028',
        offset: [0.004, -0.022],
      },
    ],
    stats: [
      { value: '1.5M', label: 'Planned residents', gold: true },
      { value: 'Long', label: 'Horizon play', gold: false },
    ],
    pillTag: 'Master planned · Airport corridor',
    badge: '1.5M planned residents',
  },
]

function getInfraStatusClass(status) {
  const value = status.toLowerCase()
  if (value.includes('operational') || value.includes('govt')) return 'is-operational'
  if (value.includes('construction') || value.includes('active')) return 'is-construction'
  return 'is-planned'
}

function getInfraCoordinates(corridor, item) {
  const [lng, lat] = corridor.coordinates
  const [dLng, dLat] = item.offset ?? [0, 0]
  return [lng + dLng, lat + dLat]
}

function buildInfraOverlay(corridor) {
  const [originLng, originLat] = corridor.coordinates
  const points = []
  const lines = []

  corridor.infrastructure.forEach((item, index) => {
    const coordinates = getInfraCoordinates(corridor, item)
    points.push({
      type: 'Feature',
      properties: {
        id: `${corridor.id}-${index}`,
        status: getInfraStatusClass(item.status),
      },
      geometry: { type: 'Point', coordinates },
    })
    lines.push({
      type: 'Feature',
      properties: { id: `${corridor.id}-link-${index}` },
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

const CORRIDORS = CORRIDOR_CONTENT.map((item) => {
  const location = mapLocations.find((entry) => entry.id === item.id)
  return {
    ...item,
    coordinates: location?.coordinates ?? [78.44, 17.25],
    zoom: location?.zoom ?? 12,
  }
})

function buildHighlightCircle([lng, lat], radiusKm = 2.4, steps = 64) {
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

function PlusIcon() {
  return (
    <svg className="growth-corridors__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg className="growth-corridors__cta-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 4.5 3.5 6.5v13l5.5-2 5.5 2 5.5-2v-13L14.5 6.5 9 4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 4.5v13M14.5 6.5v13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function GrowthCorridors() {
  const mapRef = useRef(null)
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [isMobileView, setIsMobileView] = useState(() => isMobileMapViewport())
  const [viewState, setViewState] = useState({
    longitude: SOUTH_HYDERABAD_VIEW.longitude,
    latitude: SOUTH_HYDERABAD_VIEW.latitude,
    zoom: SOUTH_HYDERABAD_VIEW.zoom,
    pitch: 0,
    bearing: 0,
  })

  const current = CORRIDORS[active]

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MAP_QUERY)
    const sync = () => {
      const mobile = mediaQuery.matches
      setIsMobileView(mobile)
      const map = mapRef.current?.getMap?.() ?? mapRef.current
      applyCorridorMapInteractions(map, mobile)
    }
    sync()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', sync)
      return () => mediaQuery.removeEventListener('change', sync)
    }
    mediaQuery.addListener(sync)
    return () => mediaQuery.removeListener(sync)
  }, [])

  const highlightGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: [buildHighlightCircle(current.coordinates)],
    }),
    [current.coordinates],
  )

  const infraOverlay = useMemo(() => buildInfraOverlay(current), [current])

  const flyToCorridor = useCallback((corridor) => {
    if (!corridor?.coordinates) return false

    const [longitude, latitude] = corridor.coordinates
    const zoom = Math.max(corridor.zoom ?? 12.2, 12.4)
    const mobile = isMobileMapViewport()
    const nextView = {
      longitude,
      latitude,
      zoom,
      pitch: 0,
      bearing: 0,
    }

    setViewState((prev) => ({
      ...prev,
      ...nextView,
    }))

    const mapRefObj = mapRef.current
    if (!mapRefObj) return false

    const map = typeof mapRefObj.getMap === 'function' ? mapRefObj.getMap() : mapRefObj
    if (!map || typeof map.flyTo !== 'function') return false

    try {
      map.resize?.()
    } catch {
      // Map may not be fully attached yet.
    }

    map.flyTo({
      center: [longitude, latitude],
      zoom,
      duration: 1100,
      essential: true,
      padding: mobile
        ? { top: 24, bottom: 32, left: 24, right: 24 }
        : { top: 48, bottom: 88, left: 40, right: 40 },
    })

    return true
  }, [])

  useEffect(() => {
    if (!showMap) return undefined

    let cancelled = false
    let attempts = 0
    let timerId = 0

    const tryFly = () => {
      if (cancelled) return
      const moved = flyToCorridor(CORRIDORS[active])
      if (moved || attempts >= 40) return
      attempts += 1
      timerId = window.setTimeout(tryFly, 50)
    }

    // Wait a beat for the mobile details + map layout to settle, then fly.
    timerId = window.setTimeout(tryFly, 120)

    return () => {
      cancelled = true
      window.clearTimeout(timerId)
    }
  }, [active, showMap, flyToCorridor])

  useEffect(() => {
    if (!showMap) return undefined
    const frameId = window.requestAnimationFrame(() => {
      const mapRefObj = mapRef.current
      const map = mapRefObj?.getMap?.() ?? mapRefObj
      applyCorridorMapInteractions(map, isMobileView)
      map?.resize?.()
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [showMap, isMobileView])

  const handleMapLoad = useCallback(() => {
    const mapRefObj = mapRef.current
    const map = mapRefObj?.getMap?.() ?? mapRefObj
    applyCorridorMapInteractions(map, isMobileMapViewport())
    map?.resize?.()
    flyToCorridor(CORRIDORS[active])
  }, [active, flyToCorridor])

  const selectCorridor = (index) => {
    setActive(index)
  }

  const openMap = (index = active) => {
    const corridor = CORRIDORS[index] ?? CORRIDORS[active]
    if (corridor?.coordinates) {
      const [longitude, latitude] = corridor.coordinates
      setViewState((prev) => ({
        ...prev,
        longitude,
        latitude,
        zoom: Math.max(corridor.zoom ?? 12.2, 12.4),
        pitch: 0,
        bearing: 0,
      }))
    }
    setActive(index)
    setShowMap(true)
  }

  const closeMap = () => {
    setShowMap(false)
  }

  useEffect(() => {
    if (!showMap || !isMobileView) return undefined

    const section = sectionRef.current
    if (!section) return undefined

    let timeoutId = 0
    const scrollToSectionStart = () => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const map = mapRef.current?.getMap?.() ?? mapRef.current
      map?.resize?.()
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToSectionStart()
      timeoutId = window.setTimeout(scrollToSectionStart, 160)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [showMap, isMobileView])

  return (
    <section
      ref={sectionRef}
      className={`section growth-corridors${showMap ? ' is-map-mode' : ' is-browse-mode'}${isMobileView ? ' is-mobile' : ''}`}
      id="growth-corridors"
      aria-label="Hyderabad growth corridors"
    >
      <div className="growth-corridors__shell">
        {showMap ? (
          <>
            <div className="growth-corridors__mobile-focus">
              <p className="growth-corridors__eyebrow">South Hyderabad · Growth corridors</p>
              <div className="growth-corridors__mobile-focus-body">
                <p className="growth-corridors__mobile-focus-name">{current.name}</p>
                <p className="growth-corridors__mobile-focus-tag">{current.tag}</p>
                <p className="growth-corridors__desc">{current.description}</p>
                <div className="growth-corridors__stats">
                  {current.stats.map((stat) => (
                    <div className="growth-corridors__stat" key={stat.label}>
                      <div className={`growth-corridors__stat-val${stat.gold ? ' is-gold' : ''}`}>
                        {stat.value}
                      </div>
                      <div className="growth-corridors__stat-lbl">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="growth-corridors__side">
              <header className="growth-corridors__intro">
                <div className="growth-corridors__intro-copy">
                  <p className="growth-corridors__eyebrow">South Hyderabad · Growth corridors</p>
                  <h2 className="growth-corridors__heading">
                    Explore locations shaping the next phase of Hyderabad
                  </h2>
                </div>
                <button
                  type="button"
                  className="growth-corridors__mode-btn growth-corridors__mode-btn--ghost"
                  onClick={closeMap}
                >
                  Back to locations
                </button>
              </header>

              <div className="growth-corridors__list" role="list">
                {CORRIDORS.map((corridor, index) => {
                  const isActive = index === active
                  const num = String(index + 1).padStart(2, '0')

                  return (
                    <div
                      key={corridor.id}
                      className={`growth-corridors__item${isActive ? ' is-active' : ''}`}
                      role="listitem"
                    >
                      <button
                        type="button"
                        className="growth-corridors__trigger"
                        aria-expanded={isActive}
                        aria-controls={`growth-corridor-panel-${corridor.id}`}
                        id={`growth-corridor-trigger-${corridor.id}`}
                        onClick={() => selectCorridor(index)}
                      >
                        <span className="growth-corridors__trigger-main">
                          <span className="growth-corridors__num">{num}</span>
                          <span className="growth-corridors__titles">
                            <span className="growth-corridors__name">{corridor.name}</span>
                            <span className="growth-corridors__tag">{corridor.tag}</span>
                          </span>
                        </span>
                        <span className="growth-corridors__icon-wrap" aria-hidden="true">
                          <PlusIcon />
                        </span>
                      </button>

                      <div
                        className="growth-corridors__details"
                        id={`growth-corridor-panel-${corridor.id}`}
                        role="region"
                        aria-labelledby={`growth-corridor-trigger-${corridor.id}`}
                        aria-hidden={!isActive}
                      >
                        <div className="growth-corridors__details-inner">
                          <p className="growth-corridors__desc">{corridor.description}</p>
                          <div className="growth-corridors__stats">
                            {corridor.stats.map((stat) => (
                              <div className="growth-corridors__stat" key={stat.label}>
                                <div
                                  className={`growth-corridors__stat-val${stat.gold ? ' is-gold' : ''}`}
                                >
                                  {stat.value}
                                </div>
                                <div className="growth-corridors__stat-lbl">{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </aside>

            <div className="growth-corridors__map-pane">
              <div className="growth-corridors__map-wrap">
                <button
                  type="button"
                  className="growth-corridors__map-back"
                  onClick={closeMap}
                >
                  ← Back
                </button>
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
                    dragPan={!isMobileView}
                    dragRotate={!isMobileView}
                    scrollZoom={!isMobileView}
                    boxZoom={!isMobileView}
                    doubleClickZoom={!isMobileView}
                    keyboard={!isMobileView}
                    touchPitch={!isMobileView}
                    touchZoomRotate={isMobileView}
                  >
                    <Source id="corridor-highlight" type="geojson" data={highlightGeoJson}>
                      <Layer
                        id="corridor-highlight-fill"
                        type="fill"
                        paint={{
                          'fill-color': '#C9A84C',
                          'fill-opacity': 0.16,
                        }}
                      />
                      <Layer
                        id="corridor-highlight-line"
                        type="line"
                        paint={{
                          'line-color': '#C9A84C',
                          'line-width': 2.25,
                          'line-opacity': 0.9,
                          'line-dasharray': [2, 1.4],
                        }}
                      />
                    </Source>

                    <Source id="corridor-infra-links" type="geojson" data={infraOverlay.lines}>
                      <Layer
                        id="corridor-infra-links-line"
                        type="line"
                        paint={{
                          'line-color': '#C9A84C',
                          'line-width': 1.4,
                          'line-opacity': 0.55,
                          'line-dasharray': [1.5, 1.5],
                        }}
                      />
                    </Source>

                    <Source id="corridor-infra-points" type="geojson" data={infraOverlay.points}>
                      <Layer
                        id="corridor-infra-points-glow"
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
                        id="corridor-infra-points-core"
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

                    {mapReferencePoints.map((point) => (
                      <Marker
                        key={point.id}
                        longitude={point.coordinates[0]}
                        latitude={point.coordinates[1]}
                        anchor="center"
                        style={{ pointerEvents: 'none' }}
                      >
                        <span className="growth-corridors__ref">{point.label}</span>
                      </Marker>
                    ))}

                    {CORRIDORS.map((corridor, index) => (
                      <Marker
                        key={corridor.id}
                        longitude={corridor.coordinates[0]}
                        latitude={corridor.coordinates[1]}
                        anchor="bottom"
                        style={isMobileView ? { pointerEvents: 'none' } : undefined}
                        onClick={
                          isMobileView
                            ? undefined
                            : (event) => {
                                event.originalEvent.stopPropagation()
                                selectCorridor(index)
                              }
                        }
                      >
                        <button
                          type="button"
                          className={`growth-corridors__marker${index === active ? ' is-active' : ''}`}
                          aria-label={`Select ${corridor.name}`}
                          tabIndex={isMobileView ? -1 : 0}
                          onClick={isMobileView ? undefined : () => selectCorridor(index)}
                        >
                          <span className="growth-corridors__marker-dot" aria-hidden="true" />
                          <span className="growth-corridors__marker-label">{corridor.name}</span>
                        </button>
                      </Marker>
                    ))}

                    {current.infrastructure.map((item) => {
                      const [longitude, latitude] = getInfraCoordinates(current, item)
                      return (
                        <Marker
                          key={`${current.id}-${item.title}`}
                          longitude={longitude}
                          latitude={latitude}
                          anchor="bottom"
                          style={{ pointerEvents: 'none' }}
                        >
                          <div
                            className={`growth-corridors__infra-marker ${getInfraStatusClass(item.status)}`}
                          >
                            <span className="growth-corridors__infra-marker-icon" aria-hidden="true">
                              {item.icon}
                            </span>
                            <span className="growth-corridors__infra-marker-copy">
                              <span className="growth-corridors__infra-marker-label">{item.label}</span>
                              <span className="growth-corridors__infra-marker-status">{item.status}</span>
                            </span>
                          </div>
                        </Marker>
                      )
                    })}
                  </Map>
                ) : (
                  <div className="growth-corridors__map-fallback" role="status">
                    <p>
                      Add <code>MAPBOX_ACCESS_TOKEN</code> to load the live map.
                    </p>
                  </div>
                )}

                <div className="growth-corridors__pill">
                  <div>
                    <div className="growth-corridors__pill-name">{current.name}</div>
                    <div className="growth-corridors__pill-tag">{current.pillTag}</div>
                  </div>
                  <div className="growth-corridors__pill-badge">{current.badge}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="growth-corridors__browse">
            <header className="growth-corridors__intro">
              <div className="growth-corridors__intro-copy">
                <p className="growth-corridors__eyebrow">South Hyderabad · Growth corridors</p>
                <h2 className="growth-corridors__heading">
                  Explore locations shaping the next phase of Hyderabad
                </h2>
              </div>
              <div className="growth-corridors__map-cta">
                <span className="growth-corridors__map-cue" aria-hidden="true">
                  <svg
                    className="growth-corridors__map-cue-arrow"
                    viewBox="0 0 36 24"
                    fill="none"
                  >
                    <path
                      d="M2 12h24M18 6l10 6-10 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <button
                  type="button"
                  className="growth-corridors__mode-btn"
                  onClick={() => openMap()}
                >
                  <MapIcon />
                  View on map
                </button>
              </div>
            </header>

            <div className="growth-corridors__picker" role="list">
              {CORRIDORS.map((corridor, index) => {
                const isActive = index === active
                const num = String(index + 1).padStart(2, '0')

                return (
                  <div
                    key={corridor.id}
                    role="listitem"
                    className={`growth-corridors__pick${isActive ? ' is-active' : ''}`}
                  >
                    <button
                      type="button"
                      className="growth-corridors__pick-select"
                      aria-pressed={isActive}
                      onClick={() => selectCorridor(index)}
                    >
                      <span className="growth-corridors__num">{num}</span>
                      <span className="growth-corridors__titles">
                        <span className="growth-corridors__name">{corridor.name}</span>
                        <span className="growth-corridors__tag">{corridor.tag}</span>
                      </span>
                    </button>
                    <div className="growth-corridors__pick-foot">
                      <button
                        type="button"
                        className="growth-corridors__pick-map"
                        onClick={() => openMap(index)}
                      >
                        <span className="growth-corridors__pick-map-label">View on map</span>
                        <span className="growth-corridors__pick-map-arrow" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12h12.5M13 6.5 18.5 12 13 17.5"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="growth-corridors__spotlight" aria-live="polite">
              <div className="growth-corridors__spotlight-copy">
                <p className="growth-corridors__spotlight-name">{current.name}</p>
                <p className="growth-corridors__desc">{current.description}</p>
              </div>

              <div className="growth-corridors__spotlight-meta">
                <div className="growth-corridors__stats">
                  {current.stats.map((stat) => (
                    <div className="growth-corridors__stat" key={stat.label}>
                      <div className={`growth-corridors__stat-val${stat.gold ? ' is-gold' : ''}`}>
                        {stat.value}
                      </div>
                      <div className="growth-corridors__stat-lbl">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="growth-corridors__mode-btn growth-corridors__mode-btn--compact"
                  onClick={() => openMap(active)}
                >
                  <MapIcon />
                  View {current.name} on map
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
