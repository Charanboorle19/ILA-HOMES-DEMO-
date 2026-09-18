import { useCallback, useEffect, useRef, useState } from 'react'
import explainingVideo from '../assets/real-estate-person-explaining.mp4'
import mobilePresenterVideo from '../assets/video.mp4'
import propertyVoiceOver from '../assets/ElevenLabs_2026-09-16T05_52_25_Adam - Articulate Engineering Professor_pvc_s50_m2.mp3'
import heroPropertyImage from '../assets/about-panel/hero-property.jpg'
import PropertyMap from './PropertyMap'
import PropertyPanel from './PropertyPanel'

const MOBILE_QUERY = '(max-width: 900px)'
const MAP_FACTS_REVEAL_DELAY_MS = 2200

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

function randomPriceRange(seed) {
  let value = seed
  const next = () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value
  }
  const low = 18 + (next() % 38) // ₹18L – ₹55L
  const high = low + 12 + (next() % 42) // spread ₹12L – ₹53L above low
  const format = (amount) =>
    amount >= 100 ? `₹${(amount / 100).toFixed(1)}Cr` : `₹${amount}L`
  return `${format(low)} – ${format(high)}`
}

const properties = [
  {
    id: 'sarath-city',
    name: 'Sarath City Capital Mall',
    label: 'Sarath City Capital Mall',
    latitude: 17.457707706484552,
    longitude: 78.36396444815051,
    location: 'Kondapur · Hyderabad',
    tag: 'Commercial Landmark',
    plots: 48,
    plotSizes: 'Retail · Anchor blocks',
    priceRange: randomPriceRange(101),
    facing: 'ORR corridor',
    road: 'ORR · Gachibowli access',
    water: 'Municipal network',
    power: 'Dedicated HT feed',
    status: 'Ready to Register',
    highlight: 'Live map pin on the Kondapur commercial belt',
    image: heroPropertyImage,
    layout: { rotation: 22, cols: 4, rows: 3 },
    speech: 'We are starting at Sarath City Capital Mall in Kondapur, Hyderabad. Watch the live map as we travel to the next location.',
  },
  {
    id: 'nexus-hyderabad',
    name: 'Nexus Hyderabad Mall',
    label: 'Nexus Hyderabad Mall',
    latitude: 17.484,
    longitude: 78.4070,
    location: 'KPHB Phase 9 · Kukatpally',
    tag: 'Retail Destination',
    plots: 36,
    plotSizes: 'Mall · Food court zones',
    priceRange: randomPriceRange(202),
    facing: 'Kukatpally belt',
    road: 'KPHB Phase 9 access',
    water: 'Municipal network',
    power: 'Dedicated HT feed',
    status: 'Open for Booking',
    highlight: 'Live map pin in Kukatpally Housing Board Colony',
    image: heroPropertyImage,
    layout: { rotation: -12, cols: 5, rows: 3 },
    speech: 'We have arrived at Nexus Hyderabad Mall in Kukatpally Housing Board Colony, K P H B Phase 9, Hyderabad.',
  },
]

// Add future property-specific files here without changing the audio lifecycle below.
const voiceOvers = {
  'Sarath City Capital Mall': propertyVoiceOver,
}

function Avatar({ talking }) {
  return <svg className={`presenter-avatar ${talking ? 'is-talking' : ''}`} viewBox="0 0 200 340" aria-label="Arjun, your ILA Homes guide">
    <ellipse cx="100" cy="332" rx="52" ry="8" fill="rgba(0,0,0,.35)"/><rect x="72" y="230" width="24" height="100" rx="6" fill="#2a2420"/><rect x="104" y="230" width="24" height="100" rx="6" fill="#2a2420"/><ellipse cx="84" cy="330" rx="15" ry="6" fill="#1a1210"/><ellipse cx="116" cy="330" rx="15" ry="6" fill="#1a1210"/>
    <rect x="60" y="155" width="80" height="90" rx="12" fill="#2c2420"/><rect x="90" y="160" width="20" height="80" rx="4" fill="#f0ead8"/><rect x="96" y="165" width="8" height="60" rx="3" fill="#8b6f47"/><path d="M90 160 72 185h18ZM110 160l18 25h-18Z" fill="#241e18"/><rect x="86" y="155" width="28" height="16" rx="4" fill="#f0ead8"/><rect x="38" y="158" width="26" height="72" rx="10" fill="#2c2420"/><rect x="136" y="158" width="26" height="72" rx="10" fill="#2c2420"/><ellipse cx="51" cy="232" rx="11" ry="9" fill="#c8a882"/><ellipse cx="149" cy="232" rx="11" ry="9" fill="#c8a882"/>
    <rect x="88" y="130" width="24" height="30" rx="6" fill="#c8a882"/><ellipse cx="100" cy="108" rx="36" ry="40" fill="#c8a882"/><ellipse cx="100" cy="72" rx="36" ry="18" fill="#1a1410"/><rect x="64" y="72" width="72" height="20" fill="#1a1410"/><ellipse cx="65" cy="108" rx="7" ry="9" fill="#be9e74"/><ellipse cx="135" cy="108" rx="7" ry="9" fill="#be9e74"/><ellipse cx="86" cy="108" rx="7" ry="7.5" fill="#fff"/><ellipse cx="114" cy="108" rx="7" ry="7.5" fill="#fff"/><circle cx="87" cy="109" r="4.5" fill="#2a1a0a"/><circle cx="115" cy="109" r="4.5" fill="#2a1a0a"/><path d="M79 100q7-3 14 0M107 100q7-3 14 0M97 114q3 6 6 0" stroke="#1a1410" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path className="presenter-mouth" d="M92 128q8 5 16 0" stroke="#8b5a3a" strokeWidth="2" fill="none" strokeLinecap="round"/><rect x="77" y="102" width="20" height="14" rx="5" fill="none" stroke="#3a2e22" strokeWidth="2"/><rect x="103" y="102" width="20" height="14" rx="5" fill="none" stroke="#3a2e22" strokeWidth="2"/><path d="M97 109h6M63 109h14M123 109h14" stroke="#3a2e22" strokeWidth="1.5"/><path d="m132 170 8-5 4 10Z" fill="#8b6f47" opacity=".8"/>
  </svg>
}

export default function GuidePlaceholder() {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [travelTarget, setTravelTarget] = useState(null)
  const [detailDelay, setDetailDelay] = useState(5)
  const [inView, setInView] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [showMapFacts, setShowMapFacts] = useState(false)
  const isMobile = useIsMobileViewport()
  const presenterVideoSrc = isMobile ? mobilePresenterVideo : explainingVideo
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const fallbackTimerRef = useRef(null)
  const transitionTimerRef = useRef(null)
  const mapFactsTimerRef = useRef(null)
  const currentRef = useRef(0)
  const advanceRef = useRef(() => {})
  const inViewRef = useRef(true)
  const property = properties[current]

  currentRef.current = current
  inViewRef.current = inView

  const clearMapFactsTimer = useCallback(() => {
    if (mapFactsTimerRef.current) {
      window.clearTimeout(mapFactsTimerRef.current)
      mapFactsTimerRef.current = null
    }
  }, [])

  const scheduleMapFactsReveal = useCallback(() => {
    clearMapFactsTimer()
    setShowMapFacts(false)
    mapFactsTimerRef.current = window.setTimeout(() => {
      setShowMapFacts(true)
      mapFactsTimerRef.current = null
    }, MAP_FACTS_REVEAL_DELAY_MS)
  }, [clearMapFactsTimer])

  const stopVoiceOver = useCallback(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.onended = null
    audio.currentTime = 0
    audio.removeAttribute('src')
    audio.load()
  }, [])

  const pauseVoiceOver = useCallback(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    const audio = audioRef.current
    if (audio && !audio.paused) audio.pause()
  }, [])

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }
  }, [])

  const playVoiceOver = useCallback((propertyToPlay) => {
    if (!inViewRef.current) return
    stopVoiceOver()
    const source = voiceOvers[propertyToPlay.name]
    if (!source) {
      setDetailDelay(5)
      fallbackTimerRef.current = window.setTimeout(() => {
        fallbackTimerRef.current = null
        advanceRef.current()
      }, 5000)
      return
    }

    const audio = audioRef.current || new Audio()
    audioRef.current = audio
    audio.src = source
    audio.preload = 'auto'
    audio.onloadedmetadata = () => {
      setDetailDelay(Math.max(5, Math.min(8, audio.duration * 0.18)))
    }
    audio.onended = () => advanceRef.current()
    audio.load()
    audio.play().catch(() => {})
  }, [stopVoiceOver])

  const advanceToNext = useCallback(() => {
    const nextIndex = (currentRef.current + 1) % properties.length
    if (transitioning) return
    stopVoiceOver()
    clearTransitionTimer()
    clearMapFactsTimer()
    setShowMapFacts(false)
    setTransitioning(true)
    setTravelTarget(properties[nextIndex])
  }, [clearMapFactsTimer, clearTransitionTimer, stopVoiceOver, transitioning])

  const handleTravelComplete = useCallback(() => {
    if (!travelTarget) return
    const nextProperty = travelTarget
    setTravelTarget(null)
    setCurrent(properties.indexOf(nextProperty))
    setTransitioning(false)
    scheduleMapFactsReveal()
    playVoiceOver(nextProperty)
  }, [playVoiceOver, scheduleMapFactsReveal, travelTarget])

  advanceRef.current = advanceToNext

  const begin = useCallback(() => {
    stopVoiceOver()
    clearTransitionTimer()
    setTransitioning(false)
    setTravelTarget(null)
    setCurrent(0)
    scheduleMapFactsReveal()
    playVoiceOver(properties[0])
  }, [clearTransitionTimer, playVoiceOver, scheduleMapFactsReveal, stopVoiceOver])

  useEffect(() => {
    begin()
    return () => clearMapFactsTimer()
  }, [begin, clearMapFactsTimer])

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
      const audio = audioRef.current
      if (audio?.src && audio.paused && audio.currentTime > 0 && !audio.ended) {
        audio.play().catch(() => {})
      }
      return
    }

    video.pause()
    pauseVoiceOver()
  }, [inView, pauseVoiceOver])

  useEffect(() => () => {
    stopVoiceOver()
    clearTransitionTimer()
  }, [clearTransitionTimer, stopVoiceOver])

  useEffect(() => {
    setShowPanel(false)
    if (isMobile || transitioning || !inView) return undefined

    const timer = window.setTimeout(() => {
      setShowPanel(true)
    }, Math.max(0, detailDelay * 1000))

    return () => window.clearTimeout(timer)
  }, [property.id, detailDelay, transitioning, inView, isMobile])

  useEffect(() => {
    if (!(isMobile && showPanel)) {
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

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
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

  const closePanel = () => setShowPanel(false)
  const openPanel = () => setShowPanel(true)

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
        style={{ '--property-detail-delay': `${detailDelay}s` }}
      >
        <div className="presentation__top-logo">ILA <span>Homes</span></div>
        <div className="presentation__main">
          <div className="presentation__presenter">
            <header className="presentation__welcome presentation__welcome--on-video">
              <p className="presentation__welcome-eyebrow">ILA Homes</p>
              <h3>Welcome to ILA Homes</h3>
            </header>
            <div className="presentation__bubble"><strong>Arjun · ILA Homes</strong></div>
            <div className="presentation__avatar">
              <video
                ref={videoRef}
                className="presenter-video"
                key={presenterVideoSrc}
                src={presenterVideoSrc}
                autoPlay
                loop
                muted
                playsInline
                aria-label="Real estate consultant explaining ILA Homes properties"
              />
            </div>
          </div>
          <div className="presentation__property">
            <div className="presentation__card">
              <header className="presentation__welcome presentation__welcome--on-map">
                <p className="presentation__welcome-eyebrow">ILA Homes</p>
                <h3>Welcome to ILA Homes</h3>
              </header>

              <div className="presentation__map-data">
                <div className="presentation__map">
                  <PropertyMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    propertyName={property.name}
                    layout={property.layout}
                    travelTarget={travelTarget}
                    onTravelComplete={handleTravelComplete}
                    onPropertySelect={openPanel}
                  />
                  <aside
                    className={`presentation__map-facts${showMapFacts ? ' is-ready' : ''}`}
                    key={property.id}
                    aria-hidden={!showMapFacts}
                    aria-label={`${property.name} property details`}
                  >
                      <div className="presentation__fact-chip presentation__fact-chip--tl">
                        <span className="presentation__fact-chip-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 20V9l4-2 4 2 4-2 4 2v11" />
                            <path d="M4 20h16M8 20v-6h3v6M13 20v-4h3v4" />
                          </svg>
                        </span>
                        <span>
                          <strong>Plot Sizes</strong>
                          <em>{property.plotSizes}</em>
                        </span>
                      </div>

                      <div className="presentation__fact-chip presentation__fact-chip--ml">
                        <span className="presentation__fact-chip-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 16l8 4 8-4M4 12l8 4 8-4M4 8l8 4 8-4" />
                          </svg>
                        </span>
                        <span>
                          <strong>Total Plots</strong>
                          <em>{property.plots}</em>
                        </span>
                      </div>

                      <div className="presentation__fact-chip presentation__fact-chip--bl">
                        <span className="presentation__fact-chip-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 3c-3.5 4.2-5.5 7.2-5.5 9.5a5.5 5.5 0 0011 0C17.5 10.2 15.5 7.2 12 3z" />
                          </svg>
                        </span>
                        <span>
                          <strong>Water Supply</strong>
                          <em>{property.water}</em>
                        </span>
                      </div>

                      <div className="presentation__fact-chip presentation__fact-chip--tr">
                        <span className="presentation__fact-chip-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 12h16M8 8v8M16 8v8M12 6v12" strokeDasharray="0" />
                            <path d="M11 6h2M11 18h2" />
                          </svg>
                        </span>
                        <span>
                          <strong>Road Width</strong>
                          <em>{property.road}</em>
                        </span>
                      </div>

                      <div className="presentation__fact-chip presentation__fact-chip--mr">
                        <span className="presentation__fact-chip-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="8" />
                            <path d="M12 8l2.5 6H9.5L12 8z" fill="currentColor" stroke="none" />
                          </svg>
                        </span>
                        <span>
                          <strong>Facing</strong>
                          <em>{property.facing}</em>
                        </span>
                      </div>

                      <div className="presentation__fact-chip presentation__fact-chip--br">
                        <span className="presentation__fact-chip-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M13 3L6 13h5l-1 8 8-12h-5l1-6z" />
                          </svg>
                        </span>
                        <span>
                          <strong>Power Supply</strong>
                          <em>{property.power}</em>
                        </span>
                      </div>
                    </aside>
                  {!isMobile ? (
                    <div className="presentation__map-panel">
                      <PropertyPanel
                        property={showPanel ? property : null}
                        onClose={closePanel}
                        autoSelecting={showPanel}
                        autoIndex={current}
                        autoTotal={properties.length}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="presentation__controls">
              <button type="button" onClick={begin}>Restart Journey</button>
              <div className="presentation__dots" aria-label="Presentation progress">{properties.map((item, index) => <span className={index === current ? 'is-active' : ''} key={item.name} />)}</div>
              <button className="presentation__next" type="button" onClick={next}>Next Property →</button>
            </div>
          </div>
        </div>
      </div>

      {isMobile && showPanel ? (
        <button
          type="button"
          className="presentation-hero__sheet-scrim"
          aria-label="Close property details"
          onClick={closePanel}
        />
      ) : null}
      {isMobile ? (
        <PropertyPanel
          property={showPanel ? property : null}
          onClose={closePanel}
          autoSelecting={false}
          autoIndex={current}
          autoTotal={properties.length}
        />
      ) : null}
    </section>
  )
}


