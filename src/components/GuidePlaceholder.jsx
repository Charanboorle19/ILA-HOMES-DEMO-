import { useCallback, useEffect, useRef, useState } from 'react'
import explainingVideo from '../assets/real-estate-person-explaining.mp4'
import propertyVoiceOver from '../assets/ElevenLabs_2026-09-16T05_52_25_Adam - Articulate Engineering Professor_pvc_s50_m2.mp3'
import PropertyMap from './PropertyMap'
import PropertyPanel from './PropertyPanel'

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
    priceRange: 'Landmark pin',
    facing: 'ORR corridor',
    road: 'ORR · Gachibowli access',
    water: 'Municipal network',
    power: 'Dedicated HT feed',
    status: 'Ready to Register',
    highlight: 'Live map pin on the Kondapur commercial belt',
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
    priceRange: 'Landmark pin',
    facing: 'Kukatpally belt',
    road: 'KPHB Phase 9 access',
    water: 'Municipal network',
    power: 'Dedicated HT feed',
    status: 'Open for Booking',
    highlight: 'Live map pin in Kukatpally Housing Board Colony',
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
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const fallbackTimerRef = useRef(null)
  const transitionTimerRef = useRef(null)
  const currentRef = useRef(0)
  const advanceRef = useRef(() => {})
  const inViewRef = useRef(true)
  const property = properties[current]

  currentRef.current = current
  inViewRef.current = inView

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
    setTransitioning(true)
    setTravelTarget(properties[nextIndex])
  }, [clearTransitionTimer, stopVoiceOver, transitioning])

  const handleTravelComplete = useCallback(() => {
    if (!travelTarget) return
    const nextProperty = travelTarget
    setTravelTarget(null)
    setCurrent(properties.indexOf(nextProperty))
    setTransitioning(false)
    playVoiceOver(nextProperty)
  }, [playVoiceOver, travelTarget])

  advanceRef.current = advanceToNext

  const begin = useCallback(() => {
    stopVoiceOver()
    clearTransitionTimer()
    setTransitioning(false)
    setTravelTarget(null)
    setCurrent(0)
    playVoiceOver(properties[0])
  }, [clearTransitionTimer, playVoiceOver, stopVoiceOver])

  useEffect(() => {
    begin()
  }, [begin])

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
    if (transitioning || !inView) return undefined

    const timer = window.setTimeout(() => {
      setShowPanel(true)
    }, Math.max(0, detailDelay * 1000))

    return () => window.clearTimeout(timer)
  }, [property.id, detailDelay, transitioning, inView])

  const next = () => {
    advanceToNext()
  }

  return (
    <section
      ref={sectionRef}
      className="presentation-hero"
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
            <div className="presentation__bubble"><strong>Arjun · ILA Homes</strong></div>
            <div className="presentation__avatar">
              <video
                ref={videoRef}
                className="presenter-video"
                src={explainingVideo}
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
              <p className="presentation__step">Property {current + 1} of {properties.length}</p>
              <h3>{property.name}</h3>
              <p className="presentation__location">{property.location}</p>
              <div className="presentation__map-data">
                <div className="presentation__map">
                  <PropertyMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    propertyName={property.name}
                    layout={property.layout}
                    travelTarget={travelTarget}
                    onTravelComplete={handleTravelComplete}
                  />
                  <div className="presentation__map-panel">
                    <PropertyPanel
                      property={showPanel ? property : null}
                      onClose={() => setShowPanel(false)}
                      autoSelecting={showPanel}
                      autoIndex={current}
                      autoTotal={properties.length}
                    />
                  </div>
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
    </section>
  )
}


