import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { propertyLayouts } from '../data/propertyLayouts'
import './FindYourPlot.css'

function IconFamily() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 18.5c.7-2.8 2.6-4.2 4.5-4.2s3.8 1.4 4.5 4.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.8 18.5c.4-1.8 1.5-2.8 2.8-2.8 1.2 0 2.1.8 2.5 2.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconTrend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 17.5 10 11.5l3.5 3.5L20 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 8h5v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 11.5 12 5l8 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10.5V19h10v-8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19c8 0 12-5.5 12-13-5 0-12 4-12 13Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 19c3-4 6.5-7 12-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg className="find-your-plot__arrow-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h12.5M13 6.5 18.5 12 13 17.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const LIFE_STAGES = [
  {
    id: 'family',
    Icon: IconFamily,
    span: 'family',
    name: 'Starting a family',
    description:
      'Looking for a safe, growing neighbourhood with schools and parks nearby.',
    totalMatched: 12,
    matchIds: ['nallagandla-enclave', 'mansanpally-meadows', 'singapore-township'],
    reasons: {
      'nallagandla-enclave': 'Near campus belt — schools, parks, and family amenities within reach.',
      'mansanpally-meadows': 'Quiet southern layout with room to grow as the household expands.',
      'singapore-township': 'Gated compound and approved layout for a secure first home base.',
    },
  },
  {
    id: 'investment',
    Icon: IconTrend,
    span: 'investment',
    name: 'Investment first',
    description:
      'Buying for appreciation. High-growth corridors near upcoming infrastructure.',
    totalMatched: 8,
    matchIds: ['kokapet-heights', 'patancheru-gateway', 'mansanpally-meadows'],
    reasons: {
      'kokapet-heights': 'ORR + Financial District belt — strong infra-led appreciation story.',
      'patancheru-gateway': 'Pharma City corridor with early-entry pricing still open.',
      'mansanpally-meadows': 'Airport-adjacent demand with HMDA backing for resale clarity.',
    },
  },
  {
    id: 'build',
    Icon: IconHome,
    span: 'build',
    name: 'Building my home',
    description:
      'Ready to build. Need a clear layout, approved plan, and builder connections.',
    totalMatched: 17,
    matchIds: [
      'singapore-township',
      'khajaguda-residency',
      'nallagandla-enclave',
      'kokapet-heights',
    ],
    reasons: {
      'singapore-township': 'Ready-to-register plots with roads, water, and power already planned.',
      'khajaguda-residency': 'Larger plot sizes suited to custom home design.',
      'nallagandla-enclave': 'Approved enclave with clear facing and road hierarchy.',
      'kokapet-heights': 'Service-road access for construction logistics without city-centre friction.',
    },
  },
  {
    id: 'retirement',
    Icon: IconLeaf,
    span: 'retirement',
    name: 'Quiet retirement',
    description:
      'Gated community, low density, peaceful surroundings outside the city noise.',
    totalMatched: 6,
    matchIds: ['khajaguda-residency', 'mansanpally-meadows'],
    reasons: {
      'khajaguda-residency': 'Low plot count, park-facing options, calmer density.',
      'mansanpally-meadows': 'Shamshabad belt space — away from the city rush, still connected.',
    },
  },
]

const FEEL_TAGS = [
  { id: 'quiet', label: 'Away from traffic' },
  { id: 'kids', label: 'Kids can play outside' },
  { id: 'temple', label: 'Walk to a temple' },
  { id: 'resale', label: 'Good resale in 5 yrs' },
  { id: 'corner', label: 'Corner plot' },
  { id: 'gated', label: 'Gated community' },
  { id: 'main-road', label: 'Near a main road' },
  { id: 'school', label: 'School within 2km' },
  { id: 'early', label: 'No builders nearby yet' },
  { id: 'weekend', label: 'Weekend drive only' },
]

const FEEL_SCORES = {
  'singapore-township': {
    quiet: 78,
    kids: 88,
    temple: 70,
    resale: 76,
    corner: 65,
    gated: 96,
    'main-road': 60,
    school: 72,
    early: 40,
    weekend: 55,
  },
  'nallagandla-enclave': {
    quiet: 70,
    kids: 94,
    temple: 68,
    resale: 82,
    corner: 55,
    gated: 80,
    'main-road': 58,
    school: 96,
    early: 35,
    weekend: 45,
  },
  'kokapet-heights': {
    quiet: 42,
    kids: 60,
    temple: 50,
    resale: 95,
    corner: 70,
    gated: 85,
    'main-road': 96,
    school: 78,
    early: 25,
    weekend: 30,
  },
  'khajaguda-residency': {
    quiet: 88,
    kids: 82,
    temple: 74,
    resale: 80,
    corner: 98,
    gated: 90,
    'main-road': 62,
    school: 70,
    early: 45,
    weekend: 58,
  },
  'patancheru-gateway': {
    quiet: 65,
    kids: 58,
    temple: 55,
    resale: 90,
    corner: 50,
    gated: 40,
    'main-road': 88,
    school: 52,
    early: 85,
    weekend: 70,
  },
  'mansanpally-meadows': {
    quiet: 94,
    kids: 86,
    temple: 72,
    resale: 78,
    corner: 60,
    gated: 75,
    'main-road': 48,
    school: 64,
    early: 88,
    weekend: 92,
  },
}

function getLayoutById(id) {
  return propertyLayouts.find((layout) => layout.id === id)
}

function scoreFeelMatch(layoutId, selectedTags) {
  if (selectedTags.length === 0) return 0
  const scores = FEEL_SCORES[layoutId] ?? {}
  const total = selectedTags.reduce((sum, id) => sum + (scores[id] ?? 0), 0)
  return Math.round(total / selectedTags.length)
}

const MATCH_LOAD_MS = 900
const MOBILE_SHEET_QUERY = '(max-width: 980px)'

function useIsMobileSheet() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_SHEET_QUERY).matches : false,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_SHEET_QUERY)
    const sync = () => setIsMobile(mediaQuery.matches)
    sync()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', sync)
      return () => mediaQuery.removeEventListener('change', sync)
    }
    mediaQuery.addListener(sync)
    return () => mediaQuery.removeListener(sync)
  }, [])

  return isMobile
}

export default function FindYourPlot() {
  const isMobileSheet = useIsMobileSheet()
  const [mode, setMode] = useState(null)
  const [selectedStage, setSelectedStage] = useState(null)
  const [revealedStage, setRevealedStage] = useState(null)
  const [selectedFeels, setSelectedFeels] = useState([])
  const [revealedFeels, setRevealedFeels] = useState([])
  const [status, setStatus] = useState('idle')
  const [sheetOpen, setSheetOpen] = useState(false)
  const loadTimerRef = useRef(null)

  const stage = useMemo(
    () => LIFE_STAGES.find((item) => item.id === revealedStage) ?? null,
    [revealedStage],
  )

  const stageMatches = useMemo(() => {
    if (!stage) return []
    return stage.matchIds
      .map((id) => {
        const layout = getLayoutById(id)
        if (!layout) return null
        return {
          ...layout,
          reason: stage.reasons[id] ?? layout.highlight,
        }
      })
      .filter(Boolean)
  }, [stage])

  const feelMatches = useMemo(() => {
    if (revealedFeels.length === 0) return []
    return propertyLayouts
      .map((layout) => ({
        ...layout,
        matchPct: scoreFeelMatch(layout.id, revealedFeels),
        reason: layout.highlight,
      }))
      .sort((a, b) => b.matchPct - a.matchPct)
      .slice(0, 4)
  }, [revealedFeels])

  const matches = mode === 'feel' ? feelMatches : stageMatches
  const isFeelMode = mode === 'feel'
  const sheetVisible = isMobileSheet && sheetOpen && (status === 'loading' || status === 'ready')

  useEffect(() => {
    return () => {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isMobileSheet) {
      setSheetOpen(false)
      document.body.style.removeProperty('overflow')
      return undefined
    }

    if (sheetVisible) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }

    document.body.style.removeProperty('overflow')
    return undefined
  }, [isMobileSheet, sheetVisible])

  useEffect(() => {
    if (status === 'idle') setSheetOpen(false)
  }, [status])

  function runLoad(after) {
    if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current)
    setStatus('loading')
    if (isMobileSheet) setSheetOpen(true)
    loadTimerRef.current = window.setTimeout(() => {
      after()
      setStatus('ready')
      loadTimerRef.current = null
    }, MATCH_LOAD_MS)
  }

  function selectStage(id) {
    // Tap again to unselect
    if (mode === 'stage' && selectedStage === id) {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current)
      loadTimerRef.current = null
      setMode(null)
      setSelectedStage(null)
      setRevealedStage(null)
      setSelectedFeels([])
      setRevealedFeels([])
      setStatus('idle')
      setSheetOpen(false)
      return
    }

    setMode('stage')
    setSelectedStage(id)
    setSelectedFeels([])
    setRevealedFeels([])
    setRevealedStage(null)
    runLoad(() => setRevealedStage(id))
  }

  function toggleFeel(id) {
    const isOn = selectedFeels.includes(id)
    const next = isOn
      ? selectedFeels.filter((tag) => tag !== id)
      : [...selectedFeels, id]

    // Clearing the last feel tag fully resets
    if (next.length === 0) {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current)
      loadTimerRef.current = null
      setSelectedFeels([])
      setRevealedFeels([])
      setSelectedStage(null)
      setRevealedStage(null)
      setMode(null)
      setStatus('idle')
      setSheetOpen(false)
      return
    }

    setMode('feel')
    setSelectedStage(null)
    setRevealedStage(null)
    setSelectedFeels(next)
    setRevealedFeels([])

    // Removing a tag while others remain: refresh matches without forcing the sheet open again
    if (isOn) {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current)
      setStatus('loading')
      loadTimerRef.current = window.setTimeout(() => {
        setRevealedFeels(next)
        setStatus('ready')
        loadTimerRef.current = null
      }, MATCH_LOAD_MS)
      return
    }

    runLoad(() => setRevealedFeels(next))
  }

  function closeSheet() {
    setSheetOpen(false)
  }

  function reopenSheet() {
    if (!isMobileSheet) return
    if (status === 'ready' || status === 'loading') setSheetOpen(true)
  }

  const selectedLabel = isFeelMode
    ? selectedFeels.length > 0
      ? `${selectedFeels.length} feeling${selectedFeels.length === 1 ? '' : 's'}`
      : 'your feelings'
    : (LIFE_STAGES.find((item) => item.id === selectedStage)?.name ?? 'your preference')

  const resultsLabel = isFeelMode
    ? 'Based on how you want to feel'
    : (stage?.name ?? '')

  return (
    <section
      className={`find-your-plot${sheetVisible ? ' has-mobile-sheet' : ''}`}
      id="find-your-plot"
      aria-label="Find your plot by life stage"
    >
      <div className="find-your-plot__frame">
        <header className="find-your-plot__intro">
          <p className="find-your-plot__eyebrow">Find your plot</p>
          <h2 className="find-your-plot__heading">Who are you buying this for?</h2>
          <p className="find-your-plot__lede">
            Skip the generic filters. Tell us your situation — or how you want to feel —
            and we&apos;ll match you with plots that actually fit.
          </p>
        </header>

        <div className="find-your-plot__body has-results">
          <div className="find-your-plot__left">
            <div className="find-your-plot__stages" role="list" aria-label="Life stages">
              {LIFE_STAGES.map((item) => {
                const isActive = mode === 'stage' && item.id === selectedStage
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="listitem"
                    className={`find-your-plot__stage find-your-plot__stage--${item.span}${isActive ? ' is-active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => selectStage(item.id)}
                  >
                    <span className="find-your-plot__stage-icon" aria-hidden="true">
                      <item.Icon />
                    </span>
                    <span className="find-your-plot__stage-name">{item.name}</span>
                    <span className="find-your-plot__stage-desc">{item.description}</span>
                    <span className="find-your-plot__stage-foot">
                      <span className="find-your-plot__stage-result">
                        {item.totalMatched} plots matched
                      </span>
                      <span className="find-your-plot__stage-cta">
                        <span className="find-your-plot__stage-cta-label">
                          {isActive && status !== 'idle' ? 'Unselect' : 'Select'}
                        </span>
                        <span className="find-your-plot__stage-arrow" aria-hidden="true">
                          <IconArrow />
                        </span>
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="find-your-plot__or" aria-hidden="true">
              <span>or</span>
            </div>

            <div className="find-your-plot__feel">
              <p className="find-your-plot__feel-label">Tell us what you want to feel</p>
              <div
                className="find-your-plot__feel-tags"
                role="group"
                aria-label="Emotional preferences"
              >
                {FEEL_TAGS.map((tag) => {
                  const isOn = selectedFeels.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`find-your-plot__feel-tag${isOn ? ' is-selected' : ''}`}
                      aria-pressed={isOn}
                      onClick={() => toggleFeel(tag.id)}
                    >
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {isMobileSheet && status === 'ready' && !sheetOpen ? (
              <button
                type="button"
                className="find-your-plot__reopen"
                onClick={reopenSheet}
              >
                View {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              </button>
            ) : null}
          </div>

          <aside
            className={`find-your-plot__results is-${status}${sheetVisible ? ' is-sheet-open' : ''}`}
            aria-live="polite"
            aria-busy={status === 'loading'}
            aria-hidden={isMobileSheet && !sheetVisible}
          >
            <div className="find-your-plot__sheet-handle" aria-hidden="true" />
            <button
              type="button"
              className="find-your-plot__sheet-close"
              aria-label="Close matches"
              onClick={closeSheet}
            >
              ×
            </button>

            {status === 'idle' && (
              <div className="find-your-plot__state find-your-plot__state--idle">
                <span className="find-your-plot__state-mark" aria-hidden="true" />
                <p className="find-your-plot__state-title">Your matches will appear here</p>
                <p className="find-your-plot__state-copy">
                  Select a life stage above, or pick feelings below — either path works.
                </p>
              </div>
            )}

            {status === 'loading' && (
              <div className="find-your-plot__state find-your-plot__state--loading">
                <div className="find-your-plot__loader" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <p className="find-your-plot__state-title">Finding your match</p>
                <p className="find-your-plot__state-copy">
                  Searching plots for {selectedLabel}…
                </p>
                <div className="find-your-plot__progress" aria-hidden="true">
                  <span className="find-your-plot__progress-bar" />
                </div>
              </div>
            )}

            {status === 'ready' && matches.length > 0 && (
              <div className="find-your-plot__ready">
                <div className="find-your-plot__results-head">
                  <div>
                    <p className="find-your-plot__results-kicker">Your matches</p>
                    <p className="find-your-plot__results-label">{resultsLabel}</p>
                  </div>
                  <p className="find-your-plot__results-count">
                    {matches.length} {matches.length === 1 ? 'plot' : 'plots'}
                  </p>
                </div>

                <div className="find-your-plot__matches">
                  {matches.map((match, index) => (
                    <article
                      key={`${isFeelMode ? 'feel' : stage?.id}-${match.id}`}
                      className="find-your-plot__match"
                      style={{
                        '--match-i': index,
                        '--match-image': `url(${match.image})`,
                      }}
                    >
                      <div className="find-your-plot__match-shade" aria-hidden="true" />
                      <div className="find-your-plot__match-top">
                        <span className="find-your-plot__match-index">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {isFeelMode ? (
                          <span className="find-your-plot__match-pct">{match.matchPct}% match</span>
                        ) : (
                          <span className="find-your-plot__match-tag">{match.tag}</span>
                        )}
                      </div>
                      <div className="find-your-plot__match-body">
                        <h3 className="find-your-plot__match-name">{match.label}</h3>
                        <p className="find-your-plot__match-meta">
                          {match.location} · {match.plotSizes}
                        </p>
                        <p className="find-your-plot__match-reason">{match.reason}</p>
                        <div className="find-your-plot__match-foot">
                          <span className="find-your-plot__match-price">{match.priceRange}</span>
                          <Link
                            className="find-your-plot__match-link"
                            to={`/properties/${match.id}`}
                          >
                            View property
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {isMobileSheet ? (
        <button
          type="button"
          className={`find-your-plot__sheet-scrim${sheetVisible ? ' is-visible' : ''}`}
          aria-label="Close matches"
          aria-hidden={!sheetVisible}
          tabIndex={sheetVisible ? 0 : -1}
          onClick={closeSheet}
        />
      ) : null}
    </section>
  )
}
