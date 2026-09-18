import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './AboutVault.css'
import PropertyPanel from './PropertyPanel'
import { propertyLayouts } from '../data/propertyLayouts'
import { usePropertyPanel } from '../hooks/usePropertyPanel'

const MAPBOX_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN
const HAS_MAPBOX_TOKEN = Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== 'YOUR_MAPBOX_PUBLIC_TOKEN'
const HYDERABAD_CENTER = [78.34, 17.4]
const MOBILE_MAP_QUERY = '(max-width: 900px)'
const DESKTOP_OVERVIEW_MAX_ZOOM = 11.2
const MOBILE_OVERVIEW_MAX_ZOOM = 10.35
const DESKTOP_TOUR_ZOOM = 11.05
const MOBILE_TOUR_ZOOM = 10.75
const MAP_FACTS_REVEAL_DELAY_MS = 700

function isMobileMapViewport() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_MAP_QUERY).matches
}

function applyAboutMapInteractions(map) {
  if (!map) return

  if (isMobileMapViewport()) {
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

const STATS = [
  { number: '2019', label: 'Established', countUp: false },
  { number: 47, label: 'Plots Delivered', countUp: true },
  { number: '0', label: 'Disputes', countUp: false },
]

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function rotatePoint(lng, lat, originLng, originLat, degrees) {
  const rad = (degrees * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = lng - originLng
  const dy = lat - originLat
  return [originLng + dx * cos - dy * sin, originLat + dx * sin + dy * cos]
}

/**
 * Builds a gated-layout footprint: outer boundary + individual plot polygons + road spines.
 * Sizes are exaggerated so layouts read clearly at city zoom.
 */
function buildLayoutGeometry(layout) {
  const { lng, lat, rotation = 0, cols = 4, rows = 3 } = layout
  const width = 0.022 + cols * 0.0022
  const height = 0.014 + rows * 0.0018
  const halfW = width / 2
  const halfH = height / 2
  const roadGapX = width * 0.08
  const roadGapY = height * 0.1
  const padX = width * 0.04
  const padY = height * 0.05

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
      const gap = Math.min(plotW, plotH) * 0.1
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

  const roads = [
    [
      rotatePoint(lng - roadGapX * 0.2, lat - halfH + padY * 0.5, lng, lat, rotation),
      rotatePoint(lng - roadGapX * 0.2, lat + halfH - padY * 0.5, lng, lat, rotation),
    ],
    [
      rotatePoint(lng - halfW + padX * 0.5, lat - roadGapY * 0.2, lng, lat, rotation),
      rotatePoint(lng + halfW - padX * 0.5, lat - roadGapY * 0.2, lng, lat, rotation),
    ],
  ]

  return { boundary, plots, roads }
}

function buildLayoutsGeoJSON() {
  const boundaries = []
  const plots = []
  const roads = []
  const labels = []

  propertyLayouts.forEach((layout) => {
    const geometry = buildLayoutGeometry(layout)

    boundaries.push({
      type: 'Feature',
      properties: { id: layout.id, label: layout.label },
      geometry: { type: 'Polygon', coordinates: [geometry.boundary] },
    })

    geometry.plots.forEach((ring, index) => {
      plots.push({
        type: 'Feature',
        properties: { id: layout.id, parentId: layout.id, plotIndex: index },
        geometry: { type: 'Polygon', coordinates: [ring] },
      })
    })

    geometry.roads.forEach((line, index) => {
      roads.push({
        type: 'Feature',
        properties: { id: layout.id, parentId: layout.id, roadIndex: index },
        geometry: { type: 'LineString', coordinates: line },
      })
    })

    labels.push({
      type: 'Feature',
      properties: { id: layout.id, label: layout.label },
      geometry: { type: 'Point', coordinates: [layout.lng, layout.lat] },
    })
  })

  return {
    boundaries: { type: 'FeatureCollection', features: boundaries },
    plots: { type: 'FeatureCollection', features: plots },
    roads: { type: 'FeatureCollection', features: roads },
    labels: { type: 'FeatureCollection', features: labels },
  }
}

function getLayoutsBounds() {
  const bounds = new mapboxgl.LngLatBounds()
  propertyLayouts.forEach((layout) => {
    const { boundary } = buildLayoutGeometry(layout)
    boundary.forEach(([lng, lat]) => bounds.extend([lng, lat]))
  })
  return bounds
}

function StatNumber({ stat, isVisible }) {
  const [count, setCount] = useState(stat.countUp ? 0 : stat.number)

  useEffect(() => {
    if (!stat.countUp || !isVisible) return undefined

    const start = performance.now()
    let frameId

    const animate = (now) => {
      const progress = Math.min((now - start) / 1200, 1)
      const eased = 1 - (1 - progress) ** 3
      setCount(Math.round(Number(stat.number) * eased))
      if (progress < 1) frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [isVisible, stat])

  return <div className="vault-stat__number">{count}</div>
}

function getLayoutExtent(layout) {
  const { lng, lat, rotation = 0, cols = 4, rows = 3 } = layout
  const width = 0.022 + cols * 0.0022
  const height = 0.014 + rows * 0.0018
  const halfW = width / 2
  const halfH = height / 2

  const corners = [
    [lng - halfW, lat - halfH],
    [lng + halfW, lat - halfH],
    [lng + halfW, lat + halfH],
    [lng - halfW, lat + halfH],
  ].map(([x, y]) => rotatePoint(x, y, lng, lat, rotation))

  let minLng = corners[0][0]
  let maxLng = corners[0][0]
  let minLat = corners[0][1]
  let maxLat = corners[0][1]

  corners.forEach(([cornerLng, cornerLat]) => {
    minLng = Math.min(minLng, cornerLng)
    maxLng = Math.max(maxLng, cornerLng)
    minLat = Math.min(minLat, cornerLat)
    maxLat = Math.max(maxLat, cornerLat)
  })

  return { minLng, maxLng, minLat, maxLat, width, height }
}

function estimateLabelSize(label) {
  const mobile = isMobileMapViewport()
  if (mobile) {
    return {
      // Compact name tag (+ separate click hint when selected).
      width: Math.max(0.011, Math.min(0.028, label.length * 0.00105)),
      height: 0.0064,
    }
  }

  return {
    width: Math.max(0.02, label.length * 0.00165),
    height: 0.006,
  }
}

function getLabelBox(lng, lat, size, anchor) {
  const { width, height } = size
  const halfW = width / 2
  const halfH = height / 2

  switch (anchor) {
    case 'bottom':
      return { minLng: lng - halfW, maxLng: lng + halfW, minLat: lat, maxLat: lat + height }
    case 'left':
      return { minLng: lng, maxLng: lng + width, minLat: lat - halfH, maxLat: lat + halfH }
    case 'right':
      return { minLng: lng - width, maxLng: lng, minLat: lat - halfH, maxLat: lat + halfH }
    case 'top-left':
      return { minLng: lng, maxLng: lng + width, minLat: lat - height, maxLat: lat }
    case 'top-right':
      return { minLng: lng - width, maxLng: lng, minLat: lat - height, maxLat: lat }
    case 'top':
    default:
      return { minLng: lng - halfW, maxLng: lng + halfW, minLat: lat - height, maxLat: lat }
  }
}

function boxesOverlap(a, b, pad = 0.0012) {
  return !(
    a.maxLng + pad < b.minLng
    || a.minLng - pad > b.maxLng
    || a.maxLat + pad < b.minLat
    || a.minLat - pad > b.maxLat
  )
}

/** Place each name tag below its layout when possible; nudge away from other layouts/labels. */
function resolveLabelPlacements(layouts) {
  const mobile = isMobileMapViewport()
  const extents = layouts.map((layout) => ({
    layout,
    extent: getLayoutExtent(layout),
  }))
  const placed = []
  const gapScale = mobile ? 0.22 : 0.16
  const layoutPad = mobile ? 0.0024 : 0.0018
  const labelPad = mobile ? 0.003 : 0.0022

  extents.forEach(({ layout, extent }) => {
    const size = estimateLabelSize(layout.label)
    const cx = (extent.minLng + extent.maxLng) / 2
    const cy = (extent.minLat + extent.maxLat) / 2
    const gap = Math.max(extent.width, extent.height) * gapScale

    const candidates = [
      { lng: cx, lat: extent.minLat - gap, anchor: 'top' },
      { lng: cx - extent.width * 0.35, lat: extent.minLat - gap, anchor: 'top' },
      { lng: cx + extent.width * 0.35, lat: extent.minLat - gap, anchor: 'top' },
      { lng: extent.maxLng + gap, lat: cy, anchor: 'left' },
      { lng: extent.minLng - gap, lat: cy, anchor: 'right' },
      { lng: cx, lat: extent.maxLat + gap, anchor: 'bottom' },
      { lng: extent.maxLng + gap, lat: extent.minLat - gap, anchor: 'top-left' },
      { lng: extent.minLng - gap, lat: extent.minLat - gap, anchor: 'top-right' },
      { lng: cx, lat: extent.minLat - gap * 2.4, anchor: 'top' },
      { lng: cx, lat: extent.minLat - gap * 3.6, anchor: 'top' },
      { lng: extent.maxLng + gap * 1.4, lat: extent.minLat - gap * 1.6, anchor: 'top-left' },
      { lng: extent.minLng - gap * 1.4, lat: extent.minLat - gap * 1.6, anchor: 'top-right' },
      { lng: cx - extent.width * 0.55, lat: extent.minLat - gap * 2.8, anchor: 'top' },
      { lng: cx + extent.width * 0.55, lat: extent.minLat - gap * 2.8, anchor: 'top' },
    ]

    let chosen = candidates[0]
    for (const candidate of candidates) {
      const box = getLabelBox(candidate.lng, candidate.lat, size, candidate.anchor)
      const hitsOtherLayout = extents.some(({ layout: other, extent: otherExtent }) => {
        if (other.id === layout.id) return false
        return boxesOverlap(box, otherExtent, layoutPad)
      })
      const hitsOwnLayout = boxesOverlap(box, extent, mobile ? 0.0012 : 0.0008)
      const hitsOtherLabel = placed.some((item) => boxesOverlap(box, item.box, labelPad))

      if (!hitsOtherLayout && !hitsOwnLayout && !hitsOtherLabel) {
        chosen = candidate
        break
      }
    }

    placed.push({
      id: layout.id,
      layout,
      lng: chosen.lng,
      lat: chosen.lat,
      anchor: chosen.anchor,
      box: getLabelBox(chosen.lng, chosen.lat, size, chosen.anchor),
    })
  })

  return placed
}

function createMarkerElement(layout) {
  const element = document.createElement('div')
  element.className = 'ila-marker'
  element.dataset.layoutId = layout.id
  // Inner wrapper holds animation transforms — never transform the Mapbox root node
  element.innerHTML = `
    <div class="ila-marker__inner">
      <div class="ila-marker__hint" aria-hidden="true">
        <span class="ila-marker__hint-text">Click here</span>
        <span class="ila-marker__hint-line"></span>
      </div>
      <button type="button" class="ila-marker__label">
        <span class="ila-marker__name">${layout.label}</span>
      </button>
    </div>
  `
  element.setAttribute('aria-label', `${layout.label}, view details`)
  return element
}

function setLayoutsVisible(map, visibleIds) {
  if (!map) return

  const filter =
    visibleIds.length > 0
      ? ['in', 'parentId', ...visibleIds]
      : ['==', 'parentId', '']

  const boundaryFilter =
    visibleIds.length > 0
      ? ['in', 'id', ...visibleIds]
      : ['==', 'id', '']

  if (map.getLayer('about-plots-fill')) map.setFilter('about-plots-fill', filter)
  if (map.getLayer('about-plots-outline')) map.setFilter('about-plots-outline', filter)
  if (map.getLayer('about-roads')) map.setFilter('about-roads', filter)
  if (map.getLayer('about-boundary-fill')) map.setFilter('about-boundary-fill', boundaryFilter)
  if (map.getLayer('about-boundary-glow')) map.setFilter('about-boundary-glow', boundaryFilter)
  if (map.getLayer('about-boundary-outline')) map.setFilter('about-boundary-outline', boundaryFilter)
}

const EMPTY_COLLECTION = { type: 'FeatureCollection', features: [] }

function buildSelectedLayoutData(layout) {
  if (!layout) return EMPTY_COLLECTION

  const geometry = buildLayoutGeometry(layout)
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { id: layout.id, kind: 'boundary' },
        geometry: { type: 'Polygon', coordinates: [geometry.boundary] },
      },
      ...geometry.plots.map((ring, index) => ({
        type: 'Feature',
        properties: { id: layout.id, kind: 'plot', plotIndex: index },
        geometry: { type: 'Polygon', coordinates: [ring] },
      })),
    ],
  }
}

function stopLayoutShine(pulseRef) {
  if (pulseRef?.current) {
    cancelAnimationFrame(pulseRef.current)
    pulseRef.current = 0
  }
}

/** Paint the active layout green on the live layers + green overlay. */
function highlightSelectedLayout(map, selectedId, pulseRef) {
  if (!map?.getLayer('about-plots-fill')) return

  const hasSelection = Boolean(selectedId)
  const layout = hasSelection
    ? propertyLayouts.find((item) => item.id === selectedId) ?? null
    : null

  // 1) Recolor the already-visible layout layers (this is what users see)
  if (hasSelection) {
    map.setPaintProperty('about-plots-fill', 'fill-color', [
      'case',
      ['==', ['get', 'parentId'], selectedId],
      '#3D9B5F',
      '#C9A84C',
    ])
    map.setPaintProperty('about-plots-fill', 'fill-opacity', [
      'case',
      ['==', ['get', 'parentId'], selectedId],
      0.9,
      0.12,
    ])
    map.setPaintProperty('about-plots-outline', 'line-color', [
      'case',
      ['==', ['get', 'parentId'], selectedId],
      '#8FDBA8',
      '#E2C97E',
    ])
    map.setPaintProperty('about-plots-outline', 'line-width', [
      'case',
      ['==', ['get', 'parentId'], selectedId],
      2.4,
      0.6,
    ])
    map.setPaintProperty('about-plots-outline', 'line-opacity', [
      'case',
      ['==', ['get', 'parentId'], selectedId],
      1,
      0.25,
    ])
    map.setPaintProperty('about-boundary-outline', 'line-color', [
      'case',
      ['==', ['get', 'id'], selectedId],
      '#7ED99A',
      '#E2C97E',
    ])
    map.setPaintProperty('about-boundary-outline', 'line-width', [
      'case',
      ['==', ['get', 'id'], selectedId],
      4,
      1.2,
    ])
    map.setPaintProperty('about-boundary-outline', 'line-opacity', [
      'case',
      ['==', ['get', 'id'], selectedId],
      1,
      0.2,
    ])
    map.setPaintProperty('about-boundary-glow', 'line-color', [
      'case',
      ['==', ['get', 'id'], selectedId],
      '#4AA064',
      '#C9A84C',
    ])
    map.setPaintProperty('about-boundary-glow', 'line-opacity', [
      'case',
      ['==', ['get', 'id'], selectedId],
      0.55,
      0.05,
    ])
    map.setPaintProperty('about-boundary-glow', 'line-width', [
      'case',
      ['==', ['get', 'id'], selectedId],
      18,
      4,
    ])
    map.setPaintProperty('about-boundary-fill', 'fill-color', [
      'case',
      ['==', ['get', 'id'], selectedId],
      '#4AA064',
      '#C9A84C',
    ])
    map.setPaintProperty('about-boundary-fill', 'fill-opacity', [
      'case',
      ['==', ['get', 'id'], selectedId],
      0.28,
      0.04,
    ])
  } else {
    map.setPaintProperty('about-plots-fill', 'fill-color', '#C9A84C')
    map.setPaintProperty('about-plots-fill', 'fill-opacity', 0.42)
    map.setPaintProperty('about-plots-outline', 'line-color', '#E2C97E')
    map.setPaintProperty('about-plots-outline', 'line-width', 0.9)
    map.setPaintProperty('about-plots-outline', 'line-opacity', 0.85)
    map.setPaintProperty('about-boundary-outline', 'line-color', '#E2C97E')
    map.setPaintProperty('about-boundary-outline', 'line-width', 2)
    map.setPaintProperty('about-boundary-outline', 'line-opacity', 1)
    map.setPaintProperty('about-boundary-glow', 'line-color', '#C9A84C')
    map.setPaintProperty('about-boundary-glow', 'line-opacity', 0.22)
    map.setPaintProperty('about-boundary-glow', 'line-width', 6)
    map.setPaintProperty('about-boundary-fill', 'fill-color', '#C9A84C')
    map.setPaintProperty('about-boundary-fill', 'fill-opacity', 0.12)
  }

  // 2) Extra green overlay source (backup, always on top)
  const selectedSource = map.getSource('about-selected')
  if (selectedSource) {
    selectedSource.setData(buildSelectedLayoutData(layout))
  }

  stopLayoutShine(pulseRef)
  if (!hasSelection || !map.getLayer('about-selected-glow')) return

  let tick = 0
  const animate = () => {
    if (!map.getLayer('about-selected-glow')) return
    tick += 0.08
    const wave = (Math.sin(tick) + 1) / 2
    map.setPaintProperty('about-selected-glow', 'line-opacity', 0.35 + wave * 0.45)
    map.setPaintProperty('about-selected-glow', 'line-width', 14 + wave * 12)
    map.setPaintProperty('about-selected-fill', 'fill-opacity', 0.45 + wave * 0.35)
    pulseRef.current = requestAnimationFrame(animate)
  }
  pulseRef.current = requestAnimationFrame(animate)
}

function syncMarkerSelection(markerElements, selectedId) {
  markerElements.forEach((element) => {
    element.classList.toggle('is-selected', element.dataset.layoutId === selectedId)
  })
}

export default function AboutVault() {
  const sectionRef = useRef(null)
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerElementsRef = useRef([])
  const timersRef = useRef([])
  const openPanelRef = useRef(() => {})
  const shinePulseRef = useRef(0)
  const isHoveringRef = useRef(false)
  const hoveredIdRef = useRef(null)
  const setHoveredIdRef = useRef(() => {})

  const { activeProperty, openPanel, closePanel } = usePropertyPanel()
  const activePropertyRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isSplit, setIsSplit] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [isAutoSelecting, setIsAutoSelecting] = useState(false)
  const [autoIndex, setAutoIndex] = useState(0)
  const [hoveredId, setHoveredId] = useState(null)
  const [isMobileView, setIsMobileView] = useState(() => isMobileMapViewport())
  const [showMapFacts, setShowMapFacts] = useState(false)
  const [mapStatus, setMapStatus] = useState(() => (HAS_MAPBOX_TOKEN ? 'loading' : 'unavailable'))
  const [shouldReveal, setShouldReveal] = useState(false)
  const mapFactsTimerRef = useRef(null)
  const hasRevealedRef = useRef(false)

  useEffect(() => {
    openPanelRef.current = openPanel
    setHoveredIdRef.current = setHoveredId
  }, [openPanel])

  useEffect(() => {
    activePropertyRef.current = activeProperty
  }, [activeProperty])

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MAP_QUERY)
    const sync = () => setIsMobileView(mediaQuery.matches)
    sync()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', sync)
      return () => mediaQuery.removeEventListener('change', sync)
    }
    mediaQuery.addListener(sync)
    return () => mediaQuery.removeListener(sync)
  }, [])

  useEffect(() => {
    if (mapFactsTimerRef.current) {
      window.clearTimeout(mapFactsTimerRef.current)
      mapFactsTimerRef.current = null
    }

    if (!(isMobileView && (isOpen || isSplit))) {
      setShowMapFacts(false)
      return undefined
    }

    setShowMapFacts(false)
    mapFactsTimerRef.current = window.setTimeout(() => {
      setShowMapFacts(true)
      mapFactsTimerRef.current = null
    }, MAP_FACTS_REVEAL_DELAY_MS)

    return () => {
      if (mapFactsTimerRef.current) {
        window.clearTimeout(mapFactsTimerRef.current)
        mapFactsTimerRef.current = null
      }
    }
  }, [isMobileView, isOpen, isSplit])

  useEffect(() => {
    if (!HAS_MAPBOX_TOKEN || !mapContainerRef.current) {
      setMapStatus('unavailable')
      return undefined
    }

    mapboxgl.accessToken = MAPBOX_TOKEN
    setMapStatus('loading')
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: HYDERABAD_CENTER,
      zoom: 10.2,
      interactive: true,
      attributionControl: false,
    })
    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    applyAboutMapInteractions(map)

    const mediaQuery = window.matchMedia(MOBILE_MAP_QUERY)
    const syncMapInteractions = () => applyAboutMapInteractions(map)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncMapInteractions)
    } else {
      mediaQuery.addListener(syncMapInteractions)
    }

    const handleMapError = () => {
      setMapStatus((current) => (current === 'ready' ? current : 'error'))
    }
    map.on('error', handleMapError)

    map.on('load', () => {
      map.resize()
      applyAboutMapInteractions(map)

      const geo = buildLayoutsGeoJSON()

      map.addSource('about-boundaries', { type: 'geojson', data: geo.boundaries })
      map.addSource('about-plots', { type: 'geojson', data: geo.plots })
      map.addSource('about-roads', { type: 'geojson', data: geo.roads })
      map.addSource('about-selected', { type: 'geojson', data: EMPTY_COLLECTION })

      map.addLayer({
        id: 'about-boundary-fill',
        type: 'fill',
        source: 'about-boundaries',
        filter: ['==', 'id', ''],
        paint: {
          'fill-color': '#C9A84C',
          'fill-opacity': 0.12,
        },
      })

      map.addLayer({
        id: 'about-plots-fill',
        type: 'fill',
        source: 'about-plots',
        filter: ['==', 'parentId', ''],
        paint: {
          'fill-color': '#C9A84C',
          'fill-opacity': 0.42,
        },
      })

      map.addLayer({
        id: 'about-plots-outline',
        type: 'line',
        source: 'about-plots',
        filter: ['==', 'parentId', ''],
        paint: {
          'line-color': '#E2C97E',
          'line-width': 0.9,
          'line-opacity': 0.85,
        },
      })

      map.addLayer({
        id: 'about-roads',
        type: 'line',
        source: 'about-roads',
        filter: ['==', 'parentId', ''],
        paint: {
          'line-color': '#F7F8FA',
          'line-width': 2.2,
          'line-opacity': 0.35,
        },
      })

      map.addLayer({
        id: 'about-boundary-glow',
        type: 'line',
        source: 'about-boundaries',
        filter: ['==', 'id', ''],
        paint: {
          'line-color': '#C9A84C',
          'line-width': 6,
          'line-opacity': 0.22,
          'line-blur': 2,
        },
      })

      map.addLayer({
        id: 'about-boundary-outline',
        type: 'line',
        source: 'about-boundaries',
        filter: ['==', 'id', ''],
        paint: {
          'line-color': '#E2C97E',
          'line-width': 2,
          'line-opacity': 1,
        },
      })

      // Green overlay for the active layout (on top of everything)
      map.addLayer({
        id: 'about-selected-fill',
        type: 'fill',
        source: 'about-selected',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': '#3D9B5F',
          'fill-opacity': 0.65,
        },
      })

      map.addLayer({
        id: 'about-selected-glow',
        type: 'line',
        source: 'about-selected',
        filter: ['==', ['get', 'kind'], 'boundary'],
        paint: {
          'line-color': '#4AA064',
          'line-width': 18,
          'line-opacity': 0.5,
          'line-blur': 5,
        },
      })

      map.addLayer({
        id: 'about-selected-outline',
        type: 'line',
        source: 'about-selected',
        filter: ['==', ['get', 'kind'], 'boundary'],
        paint: {
          'line-color': '#8FDBA8',
          'line-width': 3.5,
          'line-opacity': 1,
        },
      })

      map.addLayer({
        id: 'about-selected-plot-lines',
        type: 'line',
        source: 'about-selected',
        filter: ['==', ['get', 'kind'], 'plot'],
        paint: {
          'line-color': '#B6F0C8',
          'line-width': 1.4,
          'line-opacity': 1,
        },
      })

      const labelPlacements = resolveLabelPlacements(propertyLayouts)
      const hoverLayers = [
        'about-boundary-fill',
        'about-plots-fill',
        'about-selected-fill',
      ]

      const readLayoutIdFromPoint = (point) => {
        const features = map.queryRenderedFeatures(point, {
          layers: hoverLayers.filter((layerId) => map.getLayer(layerId)),
        })
        if (!features.length) return null
        const props = features[0].properties ?? {}
        return props.parentId || props.id || null
      }

      const applyHover = (layoutId) => {
        if (hoveredIdRef.current === layoutId) return
        hoveredIdRef.current = layoutId
        isHoveringRef.current = Boolean(layoutId)
        setHoveredIdRef.current(layoutId)
        if (layoutId && !isMobileMapViewport()) openPanelRef.current(layoutId)
        map.getCanvas().style.cursor = layoutId ? 'pointer' : ''
      }

      map.on('mousemove', (event) => {
        if (isMobileMapViewport()) return
        applyHover(readLayoutIdFromPoint(event.point))
      })

      map.on('click', (event) => {
        if (!isMobileMapViewport()) return
        const layoutId = readLayoutIdFromPoint(event.point)
        if (!layoutId) {
          // Empty-map tap: clear hover pause and keep the auto tour running.
          applyHover(null)
          return
        }
        applyHover(layoutId)
        openPanelRef.current(layoutId)
      })

      map.on('mouseout', () => {
        if (isMobileMapViewport()) return
        applyHover(null)
      })

      markerElementsRef.current = labelPlacements.map((placement) => {
        const element = createMarkerElement(placement.layout)
        element.style.pointerEvents = 'auto'
        element.style.cursor = 'pointer'
        element.addEventListener('mouseenter', () => {
          if (isMobileMapViewport()) return
          applyHover(placement.layout.id)
        })
        element.addEventListener('mouseleave', () => {
          if (isMobileMapViewport()) return
          applyHover(null)
        })
        element.addEventListener('click', (event) => {
          if (!isMobileMapViewport()) return
          event.stopPropagation()
          applyHover(placement.layout.id)
          openPanelRef.current(placement.layout.id)
        })
        new mapboxgl.Marker({
          element,
          anchor: placement.anchor,
          offset: [0, placement.anchor.startsWith('top') ? (isMobileMapViewport() ? 4 : 8) : 0],
        })
          .setLngLat([placement.lng, placement.lat])
          .addTo(map)
        return element
      })

      map.fitBounds(getLayoutsBounds(), {
        padding: isMobileMapViewport() ? 72 : 56,
        duration: 0,
        maxZoom: isMobileMapViewport() ? MOBILE_OVERVIEW_MAX_ZOOM : DESKTOP_OVERVIEW_MAX_ZOOM,
      })

      setMapStatus('ready')
    })

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncMapInteractions)
      } else {
        mediaQuery.removeListener(syncMapInteractions)
      }
      map.off('error', handleMapError)
      stopLayoutShine(shinePulseRef)
      map.remove()
      mapRef.current = null
      markerElementsRef.current = []
    }
  }, [])

  useEffect(() => {
    if (!isSplit || !mapRef.current) return undefined

    const map = mapRef.current

    const frameId = window.requestAnimationFrame(() => {
      const mobile = isMobileMapViewport()
      map.resize()
      map.fitBounds(getLayoutsBounds(), {
        padding: mobile
          ? { top: 36, bottom: 132, left: 28, right: 28 }
          : {
              top: 48,
              bottom: 48,
              left: Math.min(window.innerWidth * 0.48, 560) + 24,
              right: 48,
            },
        duration: 700,
        maxZoom: mobile ? MOBILE_OVERVIEW_MAX_ZOOM : 11.4,
        essential: true,
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [isSplit])

  useEffect(() => {
    if (!isAutoSelecting) return undefined

    let cancelled = false
    let timeoutId = 0
    let index = 0

    const showNext = () => {
      if (cancelled) return

      const mobile = isMobileMapViewport()
      // Desktop: pause while hovering. Mobile: pause only while the sheet is open.
      const shouldPause = mobile
        ? Boolean(activePropertyRef.current)
        : isHoveringRef.current

      if (shouldPause) {
        timeoutId = window.setTimeout(showNext, 250)
        return
      }

      const layout = propertyLayouts[index]
      if (!layout) return

      setAutoIndex(index)

      const map = mapRef.current
      if (map) {
        map.resize()
      }

      // Mobile: cycle map highlights only — details open on tap.
      if (mobile) {
        highlightSelectedLayout(mapRef.current, layout.id, shinePulseRef)
        syncMarkerSelection(markerElementsRef.current, layout.id)
      } else {
        openPanel(layout.id)
      }

      if (map) {
        map.easeTo({
          center: [layout.lng, layout.lat],
          zoom: mobile ? MOBILE_TOUR_ZOOM : Math.max(map.getZoom(), DESKTOP_TOUR_ZOOM),
          duration: 700,
          essential: true,
          padding: mobile
            ? { top: 36, bottom: 128, left: 36, right: 36 }
            : {
                top: 40,
                bottom: 40,
                left: Math.min(window.innerWidth * 0.42, 520),
                right: 360,
              },
        })
      }

      // Advance to the next layout after a 2s viewing gap (covers all layouts, then loops)
      index = (index + 1) % propertyLayouts.length
      timeoutId = window.setTimeout(showNext, 2000)
    }

    // Give the mobile split layout a beat to settle/resize before the tour starts.
    timeoutId = window.setTimeout(showNext, isMobileMapViewport() ? 320 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [isAutoSelecting, openPanel])

  // Keep map highlight + markers in sync with whichever layout details are open
  useEffect(() => {
    const selectedId = (
      hoveredId
      ?? (isAutoSelecting ? propertyLayouts[autoIndex]?.id : null)
      ?? activeProperty?.id
      ?? null
    )

    const apply = () => {
      const map = mapRef.current
      if (!map?.getLayer('about-plots-fill') || !map.getSource('about-selected')) return false
      highlightSelectedLayout(map, selectedId, shinePulseRef)
      syncMarkerSelection(markerElementsRef.current, selectedId)
      return true
    }

    if (apply()) return undefined

    const retryId = window.setInterval(() => {
      if (apply()) window.clearInterval(retryId)
    }, 120)
    const stopId = window.setTimeout(() => window.clearInterval(retryId), 4000)

    return () => {
      window.clearInterval(retryId)
      window.clearTimeout(stopId)
    }
  }, [hoveredId, isAutoSelecting, autoIndex, activeProperty])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.unobserve(section)
        setShouldReveal(true)
      },
      { threshold: [0, 0.08, 0.15, 0.2], rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldReveal || hasRevealedRef.current) return
    if (mapStatus === 'loading') return

    hasRevealedRef.current = true
    const revealedIds = []

    setIsOpen(true)

    timersRef.current.push(
      window.setTimeout(() => {
        mapRef.current?.resize()
        mapRef.current?.fitBounds(getLayoutsBounds(), {
          padding: isMobileMapViewport() ? 72 : 56,
          duration: 700,
          maxZoom: isMobileMapViewport()
            ? MOBILE_OVERVIEW_MAX_ZOOM
            : DESKTOP_OVERVIEW_MAX_ZOOM,
        })
      }, 1400),
    )

    shuffle(propertyLayouts).forEach((layout, index) => {
      timersRef.current.push(
        window.setTimeout(() => {
          const map = mapRef.current
          const element = markerElementsRef.current.find(
            (item) => item.dataset.layoutId === layout.id,
          )
          element?.classList.add('is-visible')
          revealedIds.push(layout.id)
          setLayoutsVisible(map, [...revealedIds])
        }, 1500 + index * 110),
      )
    })

    timersRef.current.push(
      window.setTimeout(() => setIsSplit(true), 1900),
    )
    timersRef.current.push(
      window.setTimeout(() => setShowAbout(true), 2300),
    )
    timersRef.current.push(
      window.setTimeout(() => setShowStats(true), 2900),
    )
    timersRef.current.push(
      window.setTimeout(() => setIsAutoSelecting(true), 3400),
    )
  }, [shouldReveal, mapStatus])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [])

  const handleClosePanel = () => {
    // Mobile: closing the sheet should not stop the automatic layout tour.
    if (!isMobileView) {
      setIsAutoSelecting(false)
    }
    setHoveredId(null)
    isHoveringRef.current = false
    hoveredIdRef.current = null
    closePanel()

    if (isMobileView && isAutoSelecting) {
      const tourId = propertyLayouts[autoIndex]?.id ?? null
      highlightSelectedLayout(mapRef.current, tourId, shinePulseRef)
      syncMarkerSelection(markerElementsRef.current, tourId)
      return
    }

    highlightSelectedLayout(mapRef.current, null, shinePulseRef)
    syncMarkerSelection(markerElementsRef.current, null)
  }

  // Close details panel + stop auto-tour as soon as About leaves the main view
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const dismissAll = () => {
      setIsAutoSelecting(false)
      setHoveredId(null)
      isHoveringRef.current = false
      hoveredIdRef.current = null
      closePanel()
      highlightSelectedLayout(mapRef.current, null, shinePulseRef)
      syncMarkerSelection(markerElementsRef.current, null)
    }

    const dismissSheetOnly = () => {
      setHoveredId(null)
      isHoveringRef.current = false
      hoveredIdRef.current = null
      closePanel()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const mobile = isMobileMapViewport()

        // Mobile About is tall; only stop the tour when the section leaves the viewport.
        if (mobile) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.02) {
            dismissAll()
          } else if (entry.intersectionRatio < 0.2) {
            dismissSheetOnly()
          }
          return
        }

        if (entry.intersectionRatio < 0.35) {
          dismissAll()
        }
      },
      {
        threshold: [0, 0.02, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
        rootMargin: isMobileMapViewport() ? '0px' : '0px 0px -20% 0px',
      },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [closePanel])

  const hoveredProperty = hoveredId
    ? propertyLayouts.find((layout) => layout.id === hoveredId) ?? null
    : null

  const factsProperty =
    hoveredProperty
    ?? (isAutoSelecting ? propertyLayouts[autoIndex] ?? null : null)
    ?? activeProperty
    ?? propertyLayouts[0]
    ?? null

  // Mobile: show details only after an explicit layout / name-tag tap (openPanel).
  const panelProperty = isMobileView
    ? activeProperty
    : (hoveredProperty
      ?? (isAutoSelecting ? propertyLayouts[autoIndex] ?? activeProperty : activeProperty))

  const panelAutoSelecting = !isMobileView && isAutoSelecting && !hoveredId
  // Show once the About map is open on mobile (doors open / split), with selected layout facts.
  const showMobileMapFacts = isMobileView && (isOpen || isSplit) && Boolean(factsProperty)

  useEffect(() => {
    const sheetOpen = isMobileView && Boolean(panelProperty)
    if (!sheetOpen) {
      document.documentElement.classList.remove('is-property-sheet-open')
      document.body.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow')
      document.body.style.removeProperty('position')
      document.body.style.removeProperty('top')
      document.body.style.removeProperty('width')
      return undefined
    }

    const scrollY = window.scrollY
    const prevBody = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    }
    const prevHtml = document.documentElement.style.overflow

    document.documentElement.classList.add('is-property-sheet-open')
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.documentElement.classList.remove('is-property-sheet-open')
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody.overflow
      document.body.style.position = prevBody.position
      document.body.style.top = prevBody.top
      document.body.style.width = prevBody.width
      window.scrollTo(0, scrollY)
    }
  }, [isMobileView, panelProperty])

  return (
    <section
      ref={sectionRef}
      className={[
        'about-vault',
        isOpen ? 'is-open' : '',
        isSplit ? 'is-split' : '',
        showAbout ? 'show-about' : '',
        showStats ? 'show-stats' : '',
        isMobileView && panelProperty ? 'has-mobile-sheet' : '',
        mapStatus === 'loading' ? 'is-map-loading' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      id="about"
      aria-labelledby="about-vault-title"
    >
      <div className="about-vault__map-pane">
        <div className="about-vault__map" ref={mapContainerRef} />
        <div className="about-vault__overlay" aria-hidden="true" />
        {mapStatus === 'loading' ? (
          <div className="about-vault__loader" role="status" aria-live="polite">
            <span className="about-vault__loader-ring" aria-hidden="true" />
            <p className="about-vault__loader-label">Loading About Us</p>
          </div>
        ) : null}
        {mapStatus === 'error' ? (
          <div className="about-vault__loader about-vault__loader--error" role="status">
            <p className="about-vault__loader-label">Map could not load. Please refresh.</p>
          </div>
        ) : null}
        {showMobileMapFacts ? (
          <aside
            className={`about-vault__map-facts${showMapFacts ? ' is-ready' : ''}`}
            key={factsProperty.id}
            aria-hidden={!showMapFacts}
            aria-label={`${factsProperty.label} quick details`}
          >
            <div className="about-vault__fact-chip about-vault__fact-chip--tl">
              <span className="about-vault__fact-chip-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 8h12a3 3 0 010 6H8" />
                  <path d="M8 14h8a3 3 0 010 6H4" />
                  <path d="M8 5v14" />
                </svg>
              </span>
              <span>
                <strong>Price Range</strong>
                <em>{factsProperty.priceRange}</em>
              </span>
            </div>

            <div className="about-vault__fact-chip about-vault__fact-chip--tr">
              <span className="about-vault__fact-chip-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M8.5 12.5l2.2 2.2 4.8-5" />
                </svg>
              </span>
              <span>
                <strong>Status</strong>
                <em>{factsProperty.status}</em>
              </span>
            </div>

            <div className="about-vault__fact-chip about-vault__fact-chip--bl">
              <span className="about-vault__fact-chip-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 20V9l4-2 4 2 4-2 4 2v11" />
                  <path d="M4 20h16M8 20v-6h3v6M13 20v-4h3v4" />
                </svg>
              </span>
              <span>
                <strong>Plot Size</strong>
                <em>{factsProperty.plotSizes}</em>
              </span>
            </div>

            <div className="about-vault__fact-chip about-vault__fact-chip--br">
              <span className="about-vault__fact-chip-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8l2.5 6H9.5L12 8z" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span>
                <strong>Facing</strong>
                <em>{factsProperty.facing}</em>
              </span>
            </div>
          </aside>
        ) : null}
      </div>

      <div className="about-vault__content">
        <div className="about-vault__about">
          <span className="about-eyebrow">Who We Are</span>
          <h2 className="about-vault__heading">
            Since 2019, we&apos;ve been doing this differently.
          </h2>
          <p className="about-body">
            ILA Homes is a Hyderabad-based land developer focused on HMDA-approved
            plots in the city&apos;s fastest-growing corridors. Every property we
            list is legally verified, physically visited, and ready for you to
            build on — no shortcuts, no surprises.
          </p>
        </div>

        <div className="about-vault__stats" aria-label="ILA Homes achievements">
          {STATS.map((stat, index) => (
            <div
              className="vault-stat"
              style={{ '--stat-delay': `${index * 150}ms` }}
              key={stat.label}
            >
              <StatNumber stat={stat} isVisible={showStats} />
              <div className="vault-stat__label">{stat.label}</div>
              <div className="vault-stat__line" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      <p className="about-vault__trigger" id="about-vault-title">
        Since 2019, we&apos;ve been doing this differently.
      </p>

      <div className="about-vault__door about-vault__door--left" aria-hidden="true" />
      <div className="about-vault__door about-vault__door--right" aria-hidden="true" />
      <div className="about-vault__seam" aria-hidden="true" />

      {isMobileView
        ? createPortal(
            <>
              {panelProperty ? (
                <button
                  type="button"
                  className="about-vault__sheet-scrim"
                  aria-label="Close property details"
                  onClick={handleClosePanel}
                />
              ) : null}
              <PropertyPanel
                property={panelProperty}
                onClose={handleClosePanel}
                autoSelecting={false}
                autoIndex={autoIndex}
                autoTotal={propertyLayouts.length}
                sheet
              />
            </>,
            document.body,
          )
        : (
          <PropertyPanel
            property={panelProperty}
            onClose={handleClosePanel}
            autoSelecting={panelAutoSelecting}
            autoIndex={autoIndex}
            autoTotal={propertyLayouts.length}
          />
        )}
    </section>
  )
}
