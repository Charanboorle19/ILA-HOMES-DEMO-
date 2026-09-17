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
    copy: "While you pay monthly, the plot's value grows. In a few years, corridor appreciation may equal or exceed what you've paid in EMIs.",
  },
  {
    title: 'Loan assistance included',
    copy: 'We work with SBI, HDFC, and Axis. Pre-approval checks in 24 hours. We handle the paperwork.',
  },
  {
    title: 'Try it on any plot',
    copy: 'Select a plot first, then change the down payment to see affordability and projected value update together.',
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
          <p className="emi-appreciation__eyebrow">New — Idea 9</p>
          <h2 className="emi-appreciation__heading">
            What does a plot actually look like month to month?
          </h2>
          <p className="emi-appreciation__lede">
            Not a boring EMI calculator. A story that shows affordability and investment return
            together — select a property to unlock the controls.
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

            <div className="emi-appreciation__story">
              <p className="emi-appreciation__story-kicker">Appreciation story</p>
              <p className={`emi-appreciation__story-lead${isLocked ? ' is-blank' : ''}`}>
                {isLocked ? (
                  '—'
                ) : (
                  <>
                    If you buy {plot.name} at {plot.priceLabel} with {downPct}% down, your EMI
                    is <strong>{formatRupee(story.emi)}/month</strong>. At the ORR corridor&apos;s
                    3-year avg. appreciation of 38%, this plot could be worth{' '}
                    <strong>{formatLakhs(story.value2028)} in 2028</strong>.
                  </>
                )}
              </p>

              <div className="emi-appreciation__timeline">
                <div className="emi-appreciation__point">
                  <span>Today (2026)</span>
                  <strong className={isLocked ? 'is-blank' : ''}>
                    {isLocked ? '—' : plot.priceLabel}
                  </strong>
                </div>
                <div className="emi-appreciation__point">
                  <span>In 2028 (38% corridor avg.)</span>
                  <strong className={isLocked ? 'is-blank' : ''}>
                    {isLocked ? '—' : `~${formatLakhs(story.value2028)}`}
                  </strong>
                </div>
                <div className="emi-appreciation__point emi-appreciation__point--peak">
                  <span>In 2030 (ORR Phase 3)</span>
                  <strong className={isLocked ? 'is-blank' : ''}>
                    {isLocked ? '—' : `~${formatLakhs(story.value2030)}`}
                  </strong>
                </div>
              </div>

              <p className="emi-appreciation__disclaimer">
                Based on ORR corridor 3yr avg. of 38% appreciation. Not a guarantee — indicative of
                area trends.
              </p>
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
