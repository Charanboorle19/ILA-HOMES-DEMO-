import { useMemo, useState } from 'react'
import './EmiAppreciation.css'

const ANNUAL_RATE = 0.085
const TENURE_YEARS = 20
const APPRECIATION_3YR = 0.38

const PLOTS = [
  {
    id: 'a12',
    name: 'Plot A12',
    location: 'Narsingi',
    price: 5200000,
    priceLabel: '₹52 Lakhs',
  },
  {
    id: 'b7',
    name: 'Plot B7',
    location: 'Mokila',
    price: 3800000,
    priceLabel: '₹38 Lakhs',
  },
  {
    id: 'c3',
    name: 'Plot C3',
    location: 'Tukkuguda',
    price: 4400000,
    priceLabel: '₹44 Lakhs',
  },
  {
    id: 'kokapet',
    name: 'Kokapet Heights',
    location: 'Financial District Belt',
    price: 6800000,
    priceLabel: '₹68 Lakhs',
  },
  {
    id: 'mansanpally',
    name: 'Mansanpally Meadows',
    location: 'Shamshabad Belt',
    price: 2900000,
    priceLabel: '₹29 Lakhs',
  },
]

const INSIGHTS = [
  {
    title: 'Your EMI pays the bank. The land pays you back.',
    copy: 'Every month you pay, your plot grows in value. Buyers in our corridors have seen appreciation cover their EMI cost within 4–5 years.',
  },
  {
    title: 'Loans made easy',
    copy: 'We coordinate with SBI, HDFC and Axis Bank — pre-approval in 24 hours, paperwork handled by us.',
  },
  {
    title: 'See it for yourself',
    copy: 'Select any plot and adjust your down payment to see your monthly cost and projected returns update live.',
  },
]

function formatLakhs(amount) {
  const lakhs = amount / 100000
  if (lakhs >= 100) {
    return `₹${(lakhs / 100).toFixed(2)} Cr`
  }
  return `₹${lakhs.toFixed(lakhs >= 10 ? 0 : 1)}L`
}

function formatRupee(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

function calcEmi(principal, annualRate, years) {
  if (principal <= 0) return 0
  const monthlyRate = annualRate / 12
  const n = years * 12
  const factor = (1 + monthlyRate) ** n
  return (principal * monthlyRate * factor) / (factor - 1)
}

function buildStory(plot, downPct) {
  const downPayment = plot.price * (downPct / 100)
  const loanAmount = plot.price - downPayment
  const emi = calcEmi(loanAmount, ANNUAL_RATE, TENURE_YEARS)
  const value2028 = plot.price * (1 + APPRECIATION_3YR)
  const value2030 = plot.price * (1 + APPRECIATION_3YR * 1.45)

  return {
    downPayment,
    loanAmount,
    emi,
    value2028,
    value2030,
  }
}

export default function EmiAppreciation() {
  const [selectedId, setSelectedId] = useState(null)
  const [downPct, setDownPct] = useState(20)
  const [hint, setHint] = useState(false)
  const [storyOpen, setStoryOpen] = useState(false)

  const plot = useMemo(
    () => PLOTS.find((item) => item.id === selectedId) ?? null,
    [selectedId],
  )

  const isLocked = !plot

  const story = useMemo(() => {
    if (!plot) return null
    return buildStory(plot, downPct)
  }, [plot, downPct])

  function showSelectHint() {
    setHint(true)
    window.setTimeout(() => setHint(false), 2200)
  }

  function handleSliderChange(event) {
    if (isLocked) {
      showSelectHint()
      return
    }
    setDownPct(Number(event.target.value))
  }

  function handleSliderAttempt(event) {
    if (!isLocked) return
    event.preventDefault()
    showSelectHint()
  }

  return (
    <section
      className="emi-appreciation"
      id="emi-appreciation"
      aria-label="EMI and appreciation story"
    >
      <div className="emi-appreciation__frame">
        <header className="emi-appreciation__intro">
          <h2 className="emi-appreciation__heading">
            Plan your purchase — see size, cost and returns together
          </h2>
          <p className="emi-appreciation__lede">
            Pick a plot to see your payment breakdown, plot dimensions and estimated
            appreciation — all in one place.
          </p>
        </header>

        <div className="emi-appreciation__grid">
          <div className={`emi-appreciation__card${isLocked ? ' is-locked' : ''}`}>
            <div className="emi-appreciation__picker" role="group" aria-label="Select a property">
              <p className="emi-appreciation__picker-label">Select a property</p>
              <div className="emi-appreciation__chips">
                {PLOTS.map((item) => {
                  const isOn = item.id === selectedId
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`emi-appreciation__chip${isOn ? ' is-on' : ''}`}
                      aria-pressed={isOn}
                      onClick={() => {
                        setSelectedId(item.id)
                        setHint(false)
                      }}
                    >
                      <span>{item.name}</span>
                      <small>{item.priceLabel}</small>
                    </button>
                  )
                })}
              </div>
            </div>

            {hint && (
              <p className="emi-appreciation__hint" role="status">
                Select a property first to adjust the calculation
              </p>
            )}

            <p className={`emi-appreciation__plot${isLocked ? ' is-blank' : ''}`}>
              {isLocked
                ? 'Select a property'
                : `${plot.name} · ${plot.location} · ${plot.priceLabel}`}
            </p>

            <label
              className={`emi-appreciation__slider${isLocked ? ' is-disabled' : ''}`}
              onPointerDown={handleSliderAttempt}
            >
              <span className="emi-appreciation__slider-label">
                Down payment
                <strong>{isLocked ? '—' : `${downPct}%`}</strong>
              </span>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={downPct}
                disabled={isLocked}
                aria-disabled={isLocked}
                onChange={handleSliderChange}
                onClick={handleSliderAttempt}
              />
            </label>

            <div className="emi-appreciation__rows">
              <div className="emi-appreciation__row">
                <span>Down payment {isLocked ? '' : `(${downPct}%)`}</span>
                <strong className={isLocked ? 'is-blank' : ''}>
                  {isLocked ? '—' : formatRupee(story.downPayment)}
                </strong>
              </div>
              <div className="emi-appreciation__row">
                <span>Loan amount {isLocked ? '' : `(${100 - downPct}%)`}</span>
                <strong className={isLocked ? 'is-blank' : ''}>
                  {isLocked ? '—' : formatRupee(story.loanAmount)}
                </strong>
              </div>
              <div className="emi-appreciation__row emi-appreciation__row--emi">
                <span>
                  Monthly EMI · {TENURE_YEARS}yr · {(ANNUAL_RATE * 100).toFixed(1)}%
                </span>
                <strong className={isLocked ? 'is-blank' : ''}>
                  {isLocked ? '—' : `${formatRupee(story.emi)} / month`}
                </strong>
              </div>
            </div>

            <div className={`emi-appreciation__story${storyOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="emi-appreciation__story-toggle"
                aria-expanded={storyOpen}
                aria-controls="emi-appreciation-story-body"
                onClick={() => setStoryOpen((open) => !open)}
              >
                <span>How this plot grows in value</span>
                <span className="emi-appreciation__story-chevron" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>

              <div
                id="emi-appreciation-story-body"
                className="emi-appreciation__story-body"
                role="region"
                aria-label="How this plot grows in value"
              >
                <div className="emi-appreciation__story-body-inner">
                  <p className={`emi-appreciation__story-lead${isLocked ? ' is-blank' : ''}`}>
                    {isLocked ? (
                      '—'
                    ) : (
                      <>
                        If you buy {plot.name} at {plot.priceLabel} with {downPct}% down, your EMI
                        is <strong>{formatRupee(story.emi)}/month</strong>. At the ORR
                        corridor&apos;s 3-year avg. appreciation of 38%, this plot could be worth{' '}
                        <strong>{formatLakhs(story.value2028)} in 2028</strong>.
                      </>
                    )}
                  </p>

                  <div className="emi-appreciation__timeline">
                    <div className="emi-appreciation__point">
                      <span>What you pay today — 2026</span>
                      <strong className={isLocked ? 'is-blank' : ''}>
                        {isLocked ? '—' : plot.priceLabel}
                      </strong>
                    </div>
                    <div className="emi-appreciation__point">
                      <span>Estimated value in 2028</span>
                      <strong className={isLocked ? 'is-blank' : ''}>
                        {isLocked ? '—' : `~${formatLakhs(story.value2028)}`}
                      </strong>
                    </div>
                    <div className="emi-appreciation__point emi-appreciation__point--peak">
                      <span>Projected value in 2030 — when ORR Phase 3 completes</span>
                      <strong className={isLocked ? 'is-blank' : ''}>
                        {isLocked ? '—' : `~${formatLakhs(story.value2030)}`}
                      </strong>
                    </div>
                  </div>

                  <p className="emi-appreciation__disclaimer">
                    Estimated from 3 years of corridor growth data. Indicative only, not a
                    guaranteed return.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="emi-appreciation__insights">
            {INSIGHTS.map((item) => (
              <div key={item.title} className="emi-appreciation__insight">
                <span className="emi-appreciation__insight-mark" aria-hidden="true" />
                <div>
                  <h3 className="emi-appreciation__insight-title">{item.title}</h3>
                  <p className="emi-appreciation__insight-copy">{item.copy}</p>
                </div>
              </div>
            ))}

            {plot ? (
              <a className="emi-appreciation__cta" href="#contact">
                Calculate for my budget
                <span aria-hidden="true">→</span>
              </a>
            ) : (
              <button
                type="button"
                className="emi-appreciation__cta"
                onClick={showSelectHint}
              >
                Select a property to continue
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
