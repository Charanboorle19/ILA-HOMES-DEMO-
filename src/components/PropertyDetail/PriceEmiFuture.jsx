import { useMemo, useState } from 'react'
import './PriceEmiFuture.css'

const ANNUAL_RATE = 0.085
const TENURE_YEARS = 20
const APPRECIATION_3YR = 0.38

function formatLakhs(amount) {
  const lakhs = amount / 100000
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`
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

function buildStory(price, downPct) {
  const downPayment = price * (downPct / 100)
  const loanAmount = price - downPayment
  const emi = calcEmi(loanAmount, ANNUAL_RATE, TENURE_YEARS)
  const value2028 = price * (1 + APPRECIATION_3YR)
  const value2030 = price * (1 + APPRECIATION_3YR * 1.45)
  return { downPayment, loanAmount, emi, value2028, value2030 }
}

export default function PriceEmiFuture({ property }) {
  const [downPct, setDownPct] = useState(20)

  const story = useMemo(
    () => buildStory(property.price, downPct),
    [property.price, downPct],
  )

  const priceLabel = formatLakhs(property.price)

  return (
    <section className="pd-section pd-price" aria-labelledby="pd-price-title">
      <div className="pd__frame">
        <header className="pd-price__intro">
          <p className="pd-eyebrow">Affordability</p>
          <h2 id="pd-price-title" className="pd-heading">
            What does a plot actually look like month to month?
          </h2>
          <p className="pd-lede">
            Not a boring EMI calculator. A story that shows affordability and
            investment return together for {property.name}.
          </p>
        </header>

        <div className="pd-price__grid">
          <div className="pd-price__card">
            <p className="pd-price__plot">
              {property.name} · {property.location} · {priceLabel}
            </p>

            <label className="pd-price__slider">
              <span className="pd-price__slider-label">
                Down payment
                <strong>{downPct}%</strong>
              </span>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={downPct}
                onChange={(event) => setDownPct(Number(event.target.value))}
              />
            </label>

            <div className="pd-price__rows">
              <div className="pd-price__row">
                <span>Down payment ({downPct}%)</span>
                <strong>{formatRupee(story.downPayment)}</strong>
              </div>
              <div className="pd-price__row">
                <span>Loan amount ({100 - downPct}%)</span>
                <strong>{formatRupee(story.loanAmount)}</strong>
              </div>
              <div className="pd-price__row pd-price__row--emi">
                <span>
                  Monthly EMI · {TENURE_YEARS}yr · {(ANNUAL_RATE * 100).toFixed(1)}%
                </span>
                <strong>{formatRupee(story.emi)} / month</strong>
              </div>
            </div>

            <a className="pd-price__cta" href="mailto:hello@ilahomes.example">
              Calculate for my budget
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="pd-price__story">
            <p className="pd-price__story-kicker">Appreciation story</p>
            <p className="pd-price__story-lead">
              If you buy {property.name} at {priceLabel} with {downPct}% down,
              your EMI is <strong>{formatRupee(story.emi)}/month</strong>. At
              the ORR corridor&apos;s 3-year avg. appreciation of 38%, this plot
              could be worth{' '}
              <strong>{formatLakhs(story.value2028)} in 2028</strong>.
            </p>

            <div className="pd-price__timeline">
              <div className="pd-price__point">
                <span>Today (2026)</span>
                <strong>{priceLabel}</strong>
              </div>
              <div className="pd-price__point">
                <span>In 2028 (38% corridor avg.)</span>
                <strong>~{formatLakhs(story.value2028)}</strong>
              </div>
              <div className="pd-price__point pd-price__point--peak">
                <span>In 2030 (ORR Phase 3)</span>
                <strong>~{formatLakhs(story.value2030)}</strong>
              </div>
            </div>

            <p className="pd-price__disclaimer">
              Based on ORR corridor 3yr avg. of 38% appreciation. Not a
              guarantee — indicative of area trends.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
