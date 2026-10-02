import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import presenterVideo from '../assets/explanation-video.mp4'
import presenterVideoMobile from '../assets/ila-homes-explanation-2.mp4'
import heroPropertyImage from '../assets/about-panel/hero-property.jpg'
import MasterPlanMap from './MasterPlanMap'
import PropertyPanel from './PropertyPanel'

const MOBILE_QUERY = '(max-width: 900px)'
const PROPERTY_TRANSITION_MS = 700

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)
    const sync = () => setIsMobile(media.matches)
    sync()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync)
      return () => media.removeEventListener('change', sync)
    }
    media.addListener(sync)
    return () => media.removeListener(sync)
  }, [])

  return isMobile
}

const properties = [
  {
    id: 'sark-green-plains',
    name: 'Sark Green Plains',
    label: 'Sark Green Plains',
    latitude: 17.209444444,
    longitude: 78.453805556,
    location: 'Tukkuguda · Hyderabad',
    mapsUrl: 'https://maps.app.goo.gl/2B7CbCc4SgY6Jexa7?g_st=ic',
    tag: 'HMDA Approved Layout',
    plotNumber: 203,
    plots: 239,
    plotSizes: '435 sq yards',
    priceRange: '₹48,000 / sq yard · Negotiable',
    facing: 'East facing',
    road: '40 ft road facing',
    water: 'Underground sewerage · OH tank',
    power: 'Electricity with street lighting',
    status: 'Open for Booking',
    highlight: 'Plot 203 · 435 sq yards · East facing · 40 ft road facing',
    image: heroPropertyImage,
    layout: { rotation: 0, cols: 4, rows: 3 },
  },
]

export default function GuidePlaceholder() {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [inView, setInView] = useState(true)
  const [showPanel, setShowPanel] = useState(() =>
    typeof window !== 'undefined' ? !window.matchMedia(MOBILE_QUERY).matches : false,
  )
  const [selectedPlot, setSelectedPlot] = useState(null)
  const isMobile = useIsMobileViewport()
  const [heroTitleReady, setHeroTitleReady] = useState(false)
  const [mapFactsReady, setMapFactsReady] = useState(false)
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const transitionTimerRef = useRef(null)
  const currentRef = useRef(0)
  const property = properties[current]

  const panelProperty = (() => {
    if (!showPanel) return null
    if (!selectedPlot) return property
    const statusMap = {
      available: 'Open for Booking',
      reserved: 'Viewing',
      sold: 'Booked',
    }
    const areaLabel =
      selectedPlot.areaSqyd != null ? `${selectedPlot.areaSqyd} sq yards` : property.plotSizes
    const facingRaw = selectedPlot.facing || property.facing
    const facing =
      facingRaw && !/facing/i.test(String(facingRaw))
        ? `${facingRaw} facing`
        : facingRaw
    const status = statusMap[selectedPlot.status] || property.status
    return {
      ...property,
      label: `Plot ${selectedPlot.plotNo}`,
      plotNumber: selectedPlot.plotNo,
      plotSizes: areaLabel,
      facing,
      road: property.road,
      priceRange: property.priceRange,
      status,
      highlight: `Plot ${selectedPlot.plotNo} · ${status} · ${areaLabel}${facing ? ` · ${facing}` : ''}`,
    }
  })()

  currentRef.current = current

  useEffect(() => {
    if (!isMobile) {
      setHeroTitleReady(false)
      setMapFactsReady(false)
      return undefined
    }
    setHeroTitleReady(false)
    setMapFactsReady(false)
    const titleShowTimer = window.setTimeout(() => setHeroTitleReady(true), 4000)
    // Hide 4s after it appears (4s delay + 4s visible)
    const titleHideTimer = window.setTimeout(() => setHeroTitleReady(false), 8000)
    const factsTimer = window.setTimeout(() => setMapFactsReady(true), 1200)
    return () => {
      window.clearTimeout(titleShowTimer)
      window.clearTimeout(titleHideTimer)
      window.clearTimeout(factsTimer)
    }
  }, [isMobile])

  const factsProperty = panelProperty || property
  const factsFacing = factsProperty.facing
  const factsArea = factsProperty.plotSizes

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }
  }, [])

  const advanceToNext = useCallback(() => {
    const nextIndex = (currentRef.current + 1) % properties.length
    if (transitioning) return
    clearTransitionTimer()
    setTransitioning(true)
    transitionTimerRef.current = window.setTimeout(() => {
      transitionTimerRef.current = null
      setCurrent(nextIndex)
      setTransitioning(false)
    }, PROPERTY_TRANSITION_MS)
  }, [clearTransitionTimer, transitioning])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35)
      },
      { threshold: [0, 0.35, 0.6, 1] },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (inView) {
      video.play().catch(() => {})
      return
    }

    video.pause()
  }, [inView])

  useEffect(() => () => {
    clearTransitionTimer()
  }, [clearTransitionTimer])

  useEffect(() => {
    setSelectedPlot(null)
    if (isMobile || transitioning || !inView) {
      setShowPanel(false)
      return undefined
    }

    setShowPanel(true)
    return undefined
  }, [property.id, transitioning, inView, isMobile])

  useEffect(() => {
    if (!(isMobile && showPanel)) {
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
  }, [isMobile, showPanel])

  const next = () => {
    advanceToNext()
  }

  const closePanel = () => {
    setShowPanel(false)
    setSelectedPlot(null)
  }

  useEffect(() => {
    const onMessage = (event) => {
      const data = event.data
      if (!data || data.source !== 'ila-master-plan') return
      if (data.channel && data.channel !== 'hero') return
      if (data.type === 'plot-select' && data.plot) {
        setSelectedPlot(data.plot)
        setShowPanel(true)
        return
      }
      if (data.type === 'plot-clear') {
        setSelectedPlot(null)
        setShowPanel(false)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`presentation-hero${isMobile && showPanel ? ' has-mobile-sheet' : ''}`}
      id="explore"
      aria-label="ILA Homes guided property presentation"
    >
      <div
        className="presentation"
        data-started="true"
        data-transitioning={transitioning}
      >
        <div className="presentation__main">
          <div className="presentation__presenter">
            <header className="presentation__welcome presentation__welcome--on-video">
              <h3>Welcome to ILA Homes</h3>
            </header>
            <div className="presentation__avatar">
              <video
                key={isMobile ? 'mobile' : 'desktop'}
                ref={videoRef}
                className="presenter-video"
                src={isMobile ? presenterVideoMobile : presenterVideo}
                autoPlay
                loop
                muted
                playsInline
                aria-label="Sark Green Plains property explanation"
              />
            </div>
          </div>
          <div className="presentation__property">
            <div className="presentation__card">
              <header className="presentation__welcome presentation__welcome--on-map">
                <h3 className="sr-only">Sark Green Plains</h3>
              </header>

              <div className="presentation__map-data">
                <div className="presentation__map presentation__map--master-plan">
                  <MasterPlanMap />
                  <div
                    className={`presentation__map-tag${isMobile && heroTitleReady ? ' is-hidden' : ''}`}
                    aria-hidden={isMobile && heroTitleReady}
                    aria-label={`${property.label}, Tukkuguda`}
                  >
                    <strong className="presentation__map-tag-name">{property.label}</strong>
                    <span className="presentation__map-tag-loc">
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                      Tukkuguda
                    </span>
                  </div>
                  <div
                    className={`presentation__map-hero-title${heroTitleReady ? ' is-revealed' : ''}`}
                    aria-hidden={!heroTitleReady}
                  >
                    <p className="presentation__map-hero-title-eyebrow">ILA Homes · Tukkuguda</p>
                    <h2 className="presentation__map-hero-title-text">
                      <span className="presentation__map-hero-title-depth" aria-hidden="true">
                        Sark Green Plains
                      </span>
                      <span className="presentation__map-hero-title-face">Sark Green Plains</span>
                    </h2>
                  </div>
                  {isMobile ? (
                    <aside
                      className={`presentation__map-facts${mapFactsReady ? ' is-ready' : ''}`}
                      aria-hidden={!mapFactsReady}
                      aria-label={`${factsProperty.label} quick details`}
                    >
                      <div className="presentation__fact-chip presentation__fact-chip--tl">
                        <span className="presentation__fact-chip-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 20V9l4-2 4 2 4-2 4 2v11" />
                            <path d="M4 20h16M8 20v-6h3v6M13 20v-4h3v4" />
                          </svg>
                        </span>
                        <span>
                          <strong>Area</strong>
                          <em>{factsArea}</em>
                        </span>
                      </div>
                      <div className="presentation__fact-chip presentation__fact-chip--tr">
                        <span className="presentation__fact-chip-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="8" />
                            <path d="M12 8l2.5 6H9.5L12 8z" fill="currentColor" stroke="none" />
                          </svg>
                        </span>
                        <span>
                          <strong>Facing</strong>
                          <em>{factsFacing}</em>
                        </span>
                      </div>
                    </aside>
                  ) : null}
                  {!isMobile ? (
                    <div className="presentation__map-panel">
                      <PropertyPanel
                        property={panelProperty}
                        onClose={closePanel}
                        autoSelecting={showPanel && !selectedPlot}
                        autoIndex={current}
                        autoTotal={properties.length}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="presentation__controls">
              <Link className="presentation__view-property" to={`/properties/${property.id}`}>
                <span>View this property</span>
                <span className="presentation__view-property-arrow" aria-hidden="true">→</span>
              </Link>
              <button className="presentation__next" type="button" onClick={next}>
                Next Property
                <span className="presentation__next-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobile
        ? createPortal(
            <>
              {showPanel ? (
                <button
                  type="button"
                  className="presentation-hero__sheet-scrim"
                  aria-label="Close property details"
                  onClick={closePanel}
                />
              ) : null}
              <PropertyPanel
                property={panelProperty}
                onClose={closePanel}
                autoSelecting={false}
                autoIndex={current}
                autoTotal={properties.length}
                sheet
              />
            </>,
            document.body,
          )
        : null}
    </section>
  )
}


