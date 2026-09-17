import { useMemo, useState } from 'react'
import shareFamilyImg from '../assets/Sharing Dream Plots With Family.png'
import { propertyLayouts } from '../data/propertyLayouts'
import './ShortlistShare.css'

const APPRECIATION = {
  'singapore-township': 76,
  'nallagandla-enclave': 82,
  'kokapet-heights': 91,
  'khajaguda-residency': 74,
  'patancheru-gateway': 88,
  'mansanpally-meadows': 79,
}

const PROPERTIES = propertyLayouts.map((layout) => ({
  id: layout.id,
  name: layout.label,
  location: layout.location,
  meta: `${layout.plotSizes} · ${layout.priceRange} · ${layout.tag}`,
  highlight: layout.highlight,
  score: APPRECIATION[layout.id] ?? 70,
}))

const FEATURES = [
  {
    number: '01',
    title: 'Save as you browse',
    copy: 'Pin plots while exploring — no login needed.',
  },
  {
    number: '02',
    title: 'WhatsApp-ready card',
    copy: 'One tap builds a clean summary your family can read in seconds.',
  },
  {
    number: '03',
    title: 'Shareable link',
    copy: 'Anyone who opens it sees the same shortlist, with full context.',
  },
]

function buildShareText(plots) {
  const lines = plots.map(
    (plot) =>
      `• ${plot.name} · ${plot.location}\n  ${plot.meta}\n  Appreciation: ${plot.score}/100`,
  )
  return [
    'My shortlisted plots via ILA Homes',
    '',
    ...lines,
    '',
    'Open the shortlist to review together.',
  ].join('\n')
}

export default function ShortlistShare() {
  const [pinned, setPinned] = useState([
    'nallagandla-enclave',
    'kokapet-heights',
  ])
  const [shared, setShared] = useState(false)

  const selected = useMemo(
    () => PROPERTIES.filter((plot) => pinned.includes(plot.id)),
    [pinned],
  )

  function togglePlot(id) {
    setPinned((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      return [...prev, id]
    })
    setShared(false)
  }

  function shareOnWhatsApp() {
    if (selected.length === 0) return
    const text = buildShareText(selected)
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setShared(true)
  }

  return (
    <section className="shortlist-share" id="shortlist-share" aria-label="Shortlist and share">
      <div className="shortlist-share__frame">
        <div className="shortlist-share__left">
          <header className="shortlist-share__intro">
            <p className="shortlist-share__eyebrow">New — Idea 7</p>
            <h2 className="shortlist-share__heading">
              Save your shortlist. Share it on WhatsApp in one tap.
            </h2>
            <p className="shortlist-share__lede">
              Real estate in India is a family decision. Let visitors save their shortlisted
              plots and share a clean summary card with their spouse, parents, or siblings —
              without losing context or calling you first.
            </p>
          </header>

          <ol className="shortlist-share__features" aria-label="How shortlist sharing works">
            {FEATURES.map((feature) => (
              <li key={feature.number}>
                <div className="shortlist-share__feature">
                  <span className="shortlist-share__feature-index" aria-hidden="true">
                    {feature.number}
                  </span>
                  <span className="shortlist-share__feature-body">
                    <span className="shortlist-share__feature-title">{feature.title}</span>
                    <span className="shortlist-share__feature-copy">{feature.copy}</span>
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <p className="shortlist-share__count">
            {pinned.length === 0
              ? 'Select plots on the right to build your shortlist'
              : `${pinned.length} ${pinned.length === 1 ? 'plot' : 'plots'} selected`}
          </p>

          <button
            type="button"
            className="shortlist-share__share"
            onClick={shareOnWhatsApp}
            disabled={pinned.length === 0}
          >
            Share on WhatsApp
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <aside className="shortlist-share__right" aria-live="polite">
          <div className="shortlist-share__detail-inner">
            <div className="shortlist-share__copy">
              <header className="shortlist-share__detail-head">
                <p className="shortlist-share__detail-kicker">Choose plots</p>
                <h3 className="shortlist-share__detail-title">Select properties to shortlist</h3>
                <p className="shortlist-share__detail-summary">
                  Tap any property to add or remove it from your WhatsApp shortlist.
                </p>
              </header>

              <div
                className="shortlist-share__panels"
                role="group"
                aria-label="All properties"
              >
                {PROPERTIES.map((plot) => {
                  const isOn = pinned.includes(plot.id)
                  return (
                    <button
                      key={plot.id}
                      type="button"
                      className={`shortlist-share__option${isOn ? ' is-selected' : ''}`}
                      aria-pressed={isOn}
                      onClick={() => togglePlot(plot.id)}
                    >
                      <span className="shortlist-share__option-top">
                        <span className="shortlist-share__option-check" aria-hidden="true">
                          {isOn ? '✓' : ''}
                        </span>
                        <span className="shortlist-share__option-copy">
                          <span className="shortlist-share__option-name">{plot.name}</span>
                          <span className="shortlist-share__option-loc">{plot.location}</span>
                        </span>
                      </span>
                      <span className="shortlist-share__option-meta">{plot.meta}</span>
                      <span className="shortlist-share__option-score">
                        Appreciation score: {plot.score}/100
                      </span>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                className="shortlist-share__wa-btn"
                onClick={shareOnWhatsApp}
                disabled={pinned.length === 0}
              >
                {shared
                  ? 'Shared — open again'
                  : pinned.length === 0
                    ? 'Select plots to share'
                    : `Share ${pinned.length} ${pinned.length === 1 ? 'plot' : 'plots'} →`}
              </button>
            </div>

            <div className="shortlist-share__media">
              <div className="shortlist-share__media-frame">
                <img
                  className="shortlist-share__media-image"
                  src={shareFamilyImg}
                  alt="Sharing dream plots with family on WhatsApp"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
