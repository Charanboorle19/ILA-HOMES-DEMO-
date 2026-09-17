import { useEffect, useState } from 'react'
import { propertyLayouts } from '../data/propertyLayouts'
import './PlotsWithPulse.css'

const FEATURED_IDS = [
  'kokapet-heights',
  'nallagandla-enclave',
  'mansanpally-meadows',
]

const PULSE_SEED = {
  'kokapet-heights': {
    badge: 'Hot',
    viewing: 6,
    enquiries: 2,
    lastVisitedMin: 14,
    appreciation: 91,
    connectivity: 88,
    infra: 86,
  },
  'nallagandla-enclave': {
    badge: 'New',
    viewing: 2,
    enquiries: 1,
    lastVisitedMin: 8,
    appreciation: 82,
    connectivity: 79,
    infra: 74,
  },
  'mansanpally-meadows': {
    badge: 'Best Value',
    viewing: 4,
    enquiries: 3,
    lastVisitedMin: 21,
    appreciation: 79,
    connectivity: 71,
    infra: 84,
  },
}

function buildPlots() {
  return FEATURED_IDS.map((id) => {
    const layout = propertyLayouts.find((item) => item.id === id)
    const pulse = PULSE_SEED[id]
    return {
      id,
      name: layout?.label ?? id,
      location: layout?.location ?? '',
      meta: `${layout?.plotSizes ?? ''} · ${layout?.tag ?? ''}`,
      price: layout?.priceRange?.split('–')[0]?.trim() ?? layout?.priceRange ?? '',
      status: layout?.status ?? '',
      ...pulse,
    }
  })
}

function nudgeViewing(current) {
  const delta = Math.random() < 0.55 ? 1 : -1
  return Math.min(12, Math.max(1, current + delta))
}

export default function PlotsWithPulse() {
  const [plots, setPlots] = useState(buildPlots)

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlots((prev) =>
        prev.map((plot) => ({
          ...plot,
          viewing: nudgeViewing(plot.viewing),
          lastVisitedMin: Math.min(59, plot.lastVisitedMin + (Math.random() < 0.4 ? 1 : 0)),
        })),
      )
    }, 4500)

    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="plots-pulse" aria-labelledby="plots-pulse-heading">
      <div className="plots-pulse__frame">
        <header className="plots-pulse__intro">
          <p className="plots-pulse__eyebrow">Plots with pulse</p>
          <h2 id="plots-pulse-heading" className="plots-pulse__heading">
            See what others
            <br />
            are looking at right now.
          </h2>
          <p className="plots-pulse__lede">
            Live activity on each plot — who&apos;s interested, when it was last
            visited, how it&apos;s appreciated.
          </p>
        </header>

        <div className="plots-pulse__grid">
          {plots.map((plot) => (
            <article key={plot.id} className="plots-pulse__card">
              <div className="plots-pulse__image" aria-hidden="true">
                <span className="plots-pulse__image-text">
                  {plot.name} · {plot.location.split(',')[0]}
                </span>
                <span className="plots-pulse__badge">{plot.badge}</span>
                <div className="plots-pulse__live">
                  <span className="plots-pulse__ping" />
                  {plot.viewing} viewing now
                </div>
              </div>

              <div className="plots-pulse__body">
                <h3 className="plots-pulse__name">{plot.name}</h3>
                <p className="plots-pulse__meta">{plot.meta}</p>
                <p className="plots-pulse__price">{plot.price}</p>

                <ul className="plots-pulse__signals">
                  <li>
                    <span className="plots-pulse__ping plots-pulse__ping--sm" />
                    {plot.viewing} people viewing now
                  </li>
                  <li>{plot.enquiries} enquiries today</li>
                  <li>Last visited {plot.lastVisitedMin} min ago</li>
                </ul>

                <div className="plots-pulse__bars">
                  <BarRow label="Appreciation" value={plot.appreciation} />
                  <BarRow label="Connectivity" value={plot.connectivity} />
                  <BarRow label="Infra Growth" value={plot.infra} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function BarRow({ label, value }) {
  return (
    <div className="plots-pulse__bar-row">
      <span className="plots-pulse__bar-label">{label}</span>
      <div className="plots-pulse__bar-track">
        <div
          className="plots-pulse__bar-fill"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="plots-pulse__bar-val">{value}%</span>
    </div>
  )
}
