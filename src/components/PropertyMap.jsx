import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN
const HAS_MAPBOX_TOKEN =
  Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== 'YOUR_MAPBOX_PUBLIC_TOKEN'

/** Clean Mapbox basemap for the hero presentation. */
const MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11'
/** Mobile: pale desaturated basemap like the reference callouts layout. */
const MAP_STYLE_MOBILE = 'mapbox://styles/mapbox/light-v11'
const INITIAL_ZOOM = 15.6
const MOBILE_ZOOM = 14.15
const MOBILE_FIT_MAX_ZOOM = 14.55
const ROTATION_DURATION = 48000
const INITIAL_PITCH = 28
const MOBILE_PITCH = 18
const CINEMATIC_TRAVEL_DURATION = 5000
const JOURNEY_ZOOM_OUT = 11.6
const DESTINATION_ZOOM = INITIAL_ZOOM
const ZOOM_OUT_APEX = 0.24
/** Match presentation mobile breakpoint: zoom-only map, page scroll stays free. */
const MOBILE_MAP_QUERY = '(max-width: 900px)'

function isMobileMapViewport() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_MAP_QUERY).matches
}

function getHeroMapStyle() {
  return isMobileMapViewport() ? MAP_STYLE_MOBILE : MAP_STYLE_DARK
}

function getHeroDestinationZoom() {
  return isMobileMapViewport() ? MOBILE_ZOOM : DESTINATION_ZOOM
}

function getHeroPitch() {
  return isMobileMapViewport() ? MOBILE_PITCH : INITIAL_PITCH
}

function applyMobileMapInteractions(map) {
  if (!map) return

  const mobile = isMobileMapViewport()

  if (mobile) {
    // One-finger gestures scroll the page; only pinch / +/- zoom the map.
    map.dragPan.disable()
    map.scrollZoom.disable()
    map.boxZoom.disable()
    map.dragRotate.disable()
    map.keyboard.disable()
    map.doubleClickZoom.disable()
    map.touchPitch.disable()
    map.touchZoomRotate.enable()
    map.touchZoomRotate.disableRotation()
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

const LAYOUT_SOURCE = 'hero-layout'
const LAYOUT_LAYERS = [
  'hero-layout-fill',
  'hero-layout-glow',
  'hero-layout-outline',
  'hero-layout-plots',
  'hero-layout-plot-lines',
]

function hasCoordinates(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress)
}

function interpolate(start, end, progress) {
  return start + (end - start) * progress
}

function interpolateZoom(startZoom, progress) {
  const destinationZoom = getHeroDestinationZoom()

  if (progress <= ZOOM_OUT_APEX) {
    return interpolate(
      startZoom,
      JOURNEY_ZOOM_OUT,
      smoothStep(progress / ZOOM_OUT_APEX),
    )
  }

  return interpolate(
    JOURNEY_ZOOM_OUT,
    destinationZoom,
    smoothStep((progress - ZOOM_OUT_APEX) / (1 - ZOOM_OUT_APEX)),
  )
}

function rotatePoint(lng, lat, originLng, originLat, degrees) {
  const rad = (degrees * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = lng - originLng
  const dy = lat - originLat
  return [originLng + dx * cos - dy * sin, originLat + dx * sin + dy * cos]
}

/** Compact footprint scaled for a single property at street zoom. */
function buildLayoutGeometry({
  lng,
  lat,
  rotation = 18,
  cols = 4,
  rows = 3,
}) {
  const width = 0.0028 + cols * 0.00035
  const height = 0.0018 + rows * 0.00028
  const halfW = width / 2
  const halfH = height / 2
  const roadGapX = width * 0.08
  const roadGapY = height * 0.1
  const padX = width * 0.05
  const padY = height * 0.06

  const boundary = [
    [lng - halfW, lat - halfH],
    [lng + halfW, lat - halfH],
    [lng + halfW, lat + halfH],
    [lng - halfW, lat + halfH],
    [lng - halfW, lat - halfH],
  ].map(([x, y]) => rotatePoint(x, y, lng, lat, rotation))

  const plots = []
  const usableW = width - padX * 2 - roadGapX
  const usableH = height - padY * 2 - roadGapY
  const plotW = usableW / cols
  const plotH = usableH / rows
  const splitCol = Math.ceil(cols / 2)
  const splitRow = Math.ceil(rows / 2)

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x0 =
        lng - halfW + padX + col * plotW + (col >= splitCol ? roadGapX : 0)
      const y0 =
        lat - halfH + padY + row * plotH + (row >= splitRow ? roadGapY : 0)
      const gap = Math.min(plotW, plotH) * 0.12
      const ring = [
        [x0 + gap, y0 + gap],
        [x0 + plotW - gap, y0 + gap],
        [x0 + plotW - gap, y0 + plotH - gap],
        [x0 + gap, y0 + plotH - gap],
        [x0 + gap, y0 + gap],
      ].map(([x, y]) => rotatePoint(x, y, lng, lat, rotation))
      plots.push(ring)
    }
  }

  return { boundary, plots }
}

function buildLayoutFeatureCollection(longitude, latitude, layout = {}) {
  const geometry = buildLayoutGeometry({
    lng: longitude,
    lat: latitude,
    rotation: layout.rotation ?? 18,
    cols: layout.cols ?? 4,
    rows: layout.rows ?? 3,
  })

  const features = [
    {
      type: 'Feature',
      properties: { kind: 'boundary' },
      geometry: { type: 'Polygon', coordinates: [geometry.boundary] },
    },
    ...geometry.plots.map((ring) => ({
      type: 'Feature',
      properties: { kind: 'plot' },
      geometry: { type: 'Polygon', coordinates: [ring] },
    })),
  ]

  return {
    type: 'FeatureCollection',
    features,
    _bounds: geometry.boundary,
  }
}

function createMarkerElement(propertyName) {
  const wrap = document.createElement('div')
  wrap.className = 'guide-map-marker-wrap'
  wrap.setAttribute('aria-label', propertyName || 'Property location')

  const beacon = document.createElement('span')
  beacon.className = 'guide-map-marker'
  beacon.setAttribute('aria-hidden', 'true')

  const ring = document.createElement('span')
  ring.className = 'guide-map-marker__ring'

  const dot = document.createElement('span')
  dot.className = 'guide-map-marker__dot'

  const label = document.createElement('span')
  label.className = 'guide-map-marker-label'
  label.textContent = propertyName || 'Property'

  beacon.append(ring, dot)
  wrap.append(label, beacon)
  return wrap
}

function ensureLayoutLayers(map) {
  if (map.getSource(LAYOUT_SOURCE)) return

  map.addSource(LAYOUT_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })

  map.addLayer({
    id: 'hero-layout-fill',
    type: 'fill',
    source: LAYOUT_SOURCE,
    filter: ['==', ['get', 'kind'], 'boundary'],
    paint: {
      'fill-color': '#3D9B5F',
      'fill-opacity': 0.42,
    },
  })

  map.addLayer({
    id: 'hero-layout-plots',
    type: 'fill',
    source: LAYOUT_SOURCE,
    filter: ['==', ['get', 'kind'], 'plot'],
    paint: {
      'fill-color': '#4AA064',
      'fill-opacity': 0.55,
    },
  })

  map.addLayer({
    id: 'hero-layout-glow',
    type: 'line',
    source: LAYOUT_SOURCE,
    filter: ['==', ['get', 'kind'], 'boundary'],
    paint: {
      'line-color': '#4AA064',
      'line-width': 14,
      'line-opacity': 0.4,
      'line-blur': 4,
    },
  })

  map.addLayer({
    id: 'hero-layout-outline',
    type: 'line',
    source: LAYOUT_SOURCE,
    filter: ['==', ['get', 'kind'], 'boundary'],
    paint: {
      'line-color': '#8FDBA8',
      'line-width': 2.5,
      'line-opacity': 1,
    },
  })

  map.addLayer({
    id: 'hero-layout-plot-lines',
    type: 'line',
    source: LAYOUT_SOURCE,
    filter: ['==', ['get', 'kind'], 'plot'],
    paint: {
      'line-color': '#B6F0C8',
      'line-width': 1.2,
      'line-opacity': 0.95,
    },
  })
}

function setLayoutHighlight(map, longitude, latitude, layout) {
  if (!map?.getSource(LAYOUT_SOURCE)) return null

  const collection = buildLayoutFeatureCollection(longitude, latitude, layout)
  map.getSource(LAYOUT_SOURCE).setData(collection)
  return collection._bounds
}

function fitToLayout(map, boundary) {
  if (!map || !boundary?.length) return

  const mobile = isMobileMapViewport()
  const bounds = new mapboxgl.LngLatBounds()
  boundary.forEach((coord) => bounds.extend(coord))
  map.fitBounds(bounds, {
    padding: mobile ? 64 : 48,
    maxZoom: mobile ? MOBILE_FIT_MAX_ZOOM : 16.2,
    duration: 900,
    pitch: getHeroPitch(),
    bearing: map.getBearing(),
  })
}

/**
 * Interactive Mapbox map for a single property pin + layout highlight.
 * Fills the existing `.presentation__map` card; does not alter surrounding UI.
 */
export default function PropertyMap({
  latitude,
  longitude,
  propertyName,
  layout,
  travelTarget,
  onTravelComplete,
  onPropertySelect,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const markerElementRef = useRef(null)
  const mapLoadedRef = useRef(false)
  const animationFrameRef = useRef(null)
  const rotationRunningRef = useRef(false)
  const activeCoordinatesRef = useRef(null)
  const layoutRef = useRef(layout)
  const onPropertySelectRef = useRef(onPropertySelect)

  layoutRef.current = layout
  onPropertySelectRef.current = onPropertySelect

  const stopRotation = () => {
    rotationRunningRef.current = false
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  const startRotation = (map) => {
    if (!map || rotationRunningRef.current) return

    rotationRunningRef.current = true
    let startTime = null

    const rotate = (timestamp) => {
      if (!rotationRunningRef.current || mapRef.current !== map) return
      if (startTime === null) startTime = timestamp

      const elapsed = timestamp - startTime
      map.setBearing((elapsed / ROTATION_DURATION) * 360)
      animationFrameRef.current = requestAnimationFrame(rotate)
    }

    animationFrameRef.current = requestAnimationFrame(rotate)
  }

  const updateMarkerLabel = (name) => {
    const element = markerElementRef.current
    if (!element) return
    const label = element.querySelector('.guide-map-marker-label')
    if (label) label.textContent = name || 'Property'
    element.setAttribute('aria-label', name || 'Property location')
  }

  const showPropertyLayout = (map, lng, lat, name, layoutOptions, { fit = false } = {}) => {
    ensureLayoutLayers(map)
    const boundary = setLayoutHighlight(map, lng, lat, layoutOptions)
    updateMarkerLabel(name)
    markerRef.current?.setLngLat([lng, lat])
    if (fit) fitToLayout(map, boundary)
    return boundary
  }

  // Create map once; Strict Mode cleanup removes it before remount.
  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN || !containerRef.current) return undefined
    if (!hasCoordinates(latitude, longitude)) return undefined

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: getHeroMapStyle(),
      center: [longitude, latitude],
      zoom: isMobileMapViewport() ? MOBILE_ZOOM : INITIAL_ZOOM,
      bearing: 0,
      pitch: getHeroPitch(),
      attributionControl: true,
    })

    map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
        showZoom: true,
        visualizePitch: false,
      }),
      'top-right',
    )

    applyMobileMapInteractions(map)

    let usingMobileStyle = isMobileMapViewport()

    const quietBasemap = () => {
      const style = map.getStyle()
      if (!style?.layers) return

      style.layers.forEach((layer) => {
        const id = layer.id || ''
        const type = layer.type
        if (
          id.includes('poi') ||
          id.includes('transit') ||
          id.includes('airport') ||
          id.includes('rail')
        ) {
          if (type === 'symbol' || type === 'fill' || type === 'line') {
            try {
              map.setLayoutProperty(id, 'visibility', 'none')
            } catch {
              /* layer may not support visibility */
            }
          }
        }
      })
    }

    const restoreMapContent = () => {
      quietBasemap()
      applyMobileMapInteractions(map)
      ensureLayoutLayers(map)
      LAYOUT_LAYERS.forEach((layerId) => {
        map.off('click', layerId, handlePropertySelect)
        if (map.getLayer(layerId)) {
          map.on('click', layerId, handlePropertySelect)
        }
      })
      const coords = activeCoordinatesRef.current
      if (coords) {
        showPropertyLayout(
          map,
          coords[0],
          coords[1],
          propertyName,
          layoutRef.current,
          { fit: false },
        )
      }
    }

    const syncMapInteractions = () => {
      const wantsMobile = isMobileMapViewport()
      applyMobileMapInteractions(map)

      if (wantsMobile !== usingMobileStyle) {
        usingMobileStyle = wantsMobile
        map.setStyle(getHeroMapStyle())
        map.once('style.load', restoreMapContent)
      }
    }

    const mediaQuery = window.matchMedia(MOBILE_MAP_QUERY)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncMapInteractions)
    } else {
      mediaQuery.addListener(syncMapInteractions)
    }

    const markerElement = createMarkerElement(propertyName)
    markerElement.classList.add('is-hidden')
    markerElement.style.cursor = 'pointer'
    const marker = new mapboxgl.Marker({
      element: markerElement,
      anchor: 'center',
    })
      .setLngLat([longitude, latitude])
      .addTo(map)

    mapRef.current = map
    markerRef.current = marker
    markerElementRef.current = markerElement

    const handlePropertySelect = (event) => {
      event?.originalEvent?.preventDefault?.()
      event?.originalEvent?.stopPropagation?.()
      event?.preventDefault?.()
      event?.stopPropagation?.()
      onPropertySelectRef.current?.()
    }

    markerElement.addEventListener('click', handlePropertySelect)

    const bindLayoutClicks = () => {
      LAYOUT_LAYERS.forEach((layerId) => {
        map.off('click', layerId, handlePropertySelect)
        if (map.getLayer(layerId)) {
          map.on('click', layerId, handlePropertySelect)
        }
      })
    }

    const resize = () => {
      if (!mapRef.current) return
      map.resize()
    }

    const handleLoad = () => {
      resize()
      quietBasemap()
      applyMobileMapInteractions(map)
      ensureLayoutLayers(map)
      bindLayoutClicks()
      showPropertyLayout(
        map,
        longitude,
        latitude,
        propertyName,
        layoutRef.current,
        { fit: true },
      )
      mapLoadedRef.current = true
      activeCoordinatesRef.current = [longitude, latitude]
      markerElement.classList.remove('is-hidden')
      startRotation(map)
    }

    // Keep page scroll free: never re-enable pan from accidental handler resets.
    const reinstateMobileLock = () => {
      if (isMobileMapViewport()) applyMobileMapInteractions(map)
    }
    map.on('load', handleLoad)
    map.on('zoomstart', reinstateMobileLock)
    map.on('touchstart', reinstateMobileLock)

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => resize())
        : null
    observer?.observe(containerRef.current)
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncMapInteractions)
      } else {
        mediaQuery.removeListener(syncMapInteractions)
      }
      map.off('load', handleLoad)
      map.off('zoomstart', reinstateMobileLock)
      map.off('touchstart', reinstateMobileLock)
      LAYOUT_LAYERS.forEach((layerId) => {
        map.off('click', layerId, handlePropertySelect)
      })
      markerElement.removeEventListener('click', handlePropertySelect)
      stopRotation()
      observer?.disconnect()
      LAYOUT_LAYERS.forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
      })
      if (map.getSource(LAYOUT_SOURCE)) map.removeSource(LAYOUT_SOURCE)
      markerRef.current?.remove()
      markerRef.current = null
      markerElementRef.current = null
      mapLoadedRef.current = false
      map.remove()
      mapRef.current = null
    }
    // Intentionally mount-once: the map is created once and rotates after load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep highlight in sync when the active property changes (after travel / restart).
  useEffect(() => {
    if (!mapLoadedRef.current || !mapRef.current || travelTarget) return
    if (!hasCoordinates(latitude, longitude)) return

    stopRotation()
    showPropertyLayout(
      mapRef.current,
      longitude,
      latitude,
      propertyName,
      layout,
      { fit: true },
    )
    startRotation(mapRef.current)
    activeCoordinatesRef.current = [longitude, latitude]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, propertyName, layout, travelTarget])

  // Animate only when an explicit travel target is provided.
  useEffect(() => {
    if (
      !travelTarget ||
      !hasCoordinates(travelTarget.latitude, travelTarget.longitude) ||
      !mapRef.current ||
      !mapLoadedRef.current
    ) return

    const map = mapRef.current
    const marker = markerRef.current
    const target = [travelTarget.longitude, travelTarget.latitude]

    activeCoordinatesRef.current = target

    // Clear previous footprint while traveling so the highlight lands with arrival.
    if (map.getSource(LAYOUT_SOURCE)) {
      map.getSource(LAYOUT_SOURCE).setData({ type: 'FeatureCollection', features: [] })
    }
    markerElementRef.current?.classList.add('is-hidden')

    stopRotation()
    const startCamera = map.getCenter()
    const startZoom = map.getZoom()
    const startBearing = map.getBearing()
    const startPitch = map.getPitch()
    const startTime = performance.now()

    const animateJourney = (timestamp) => {
      if (mapRef.current !== map) return

      const rawProgress = Math.min(
        (timestamp - startTime) / CINEMATIC_TRAVEL_DURATION,
        1,
      )
      const movementProgress = easeInOutCubic(rawProgress)
      const zoom = interpolateZoom(startZoom, rawProgress)

      map.jumpTo({
        center: [
          interpolate(startCamera.lng, target[0], movementProgress),
          interpolate(startCamera.lat, target[1], movementProgress),
        ],
        zoom,
        bearing: interpolate(startBearing, 0, movementProgress),
        pitch: interpolate(startPitch, getHeroPitch(), movementProgress),
      })

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateJourney)
        return
      }

      animationFrameRef.current = null
      showPropertyLayout(
        map,
        travelTarget.longitude,
        travelTarget.latitude,
        travelTarget.name,
        travelTarget.layout,
        { fit: true },
      )
      marker?.getElement?.().classList.remove('is-hidden')
      startRotation(map)
      onTravelComplete?.()
    }

    animationFrameRef.current = requestAnimationFrame(animateJourney)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [onTravelComplete, travelTarget])

  if (!HAS_MAPBOX_TOKEN) {
    return (
      <div className="presentation__map-message">
        Add MAPBOX_ACCESS_TOKEN to .env.local to load the map.
      </div>
    )
  }

  if (!hasCoordinates(latitude, longitude)) {
    return (
      <div className="presentation__map-message">
        Demo coordinates will appear here when configured.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="guide-property-map"
      aria-label={`${propertyName || 'Property'} location map`}
    />
  )
}
