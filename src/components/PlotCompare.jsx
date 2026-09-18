import { useMemo, useState } from 'react'
import './PlotCompare.css'

const PLOTS = [
  {
    id: 'a12',
    code: 'Plot A12',
    location: 'Narsingi',
    price: '₹52L',
    priceValue: 52,
    area: '267 sq.yd',
    areaValue: 267,
    rate: '₹19,475 / sq.yd',
    rateValue: 19475,
    infra: 88,
    legal: 'HMDA ✓  RERA ✓',
    legalClear: true,
    appreciation: 82,
    metro: '2.1 km',
    metroValue: 2.1,
    bestMatch: true,
  },
  {
    id: 'b7',
    code: 'Plot B7',
    location: 'Mokila',
    price: '₹38L',
    priceValue: 38,
    area: '200 sq.yd',
    areaValue: 200,
    rate: '₹19,000 / sq.yd',
    rateValue: 19000,
    infra: 64,
    legal: 'RERA ✓',
    legalClear: true,
    appreciation: 60,
    metro: '6.4 km',
    metroValue: 6.4,
    bestMatch: false,
  },
  {
    id: 'c3',
    code: 'Plot C3',
    location: 'Tukkuguda',
    price: '₹44L',
    priceValue: 44,
    area: '300 sq.yd',
    areaValue: 300,
    rate: '₹14,667 / sq.yd',
    rateValue: 14667,
    infra: 76,
    legal: 'HMDA ✓  RERA ✓',
    legalClear: true,
    appreciation: 74,
    metro: '3.8 km',
    metroValue: 3.8,
    bestMatch: false,
  },
  {
    id: 'd9',
    code: 'Plot D9',
    location: 'Kokapet',
    price: '₹68L',
    priceValue: 68,
    area: '240 sq.yd',
    areaValue: 240,
    rate: '₹28,333 / sq.yd',
    rateValue: 28333,
    infra: 91,
    legal: 'HMDA ✓  RERA ✓',
    legalClear: true,
    appreciation: 86,
    metro: '1.4 km',
    metroValue: 1.4,
    bestMatch: false,
  },
  {
    id: 'e2',
    code: 'Plot E2',
    location: 'Shankarpally',
    price: '₹29L',
    priceValue: 29,
    area: '220 sq.yd',
    areaValue: 220,
    rate: '₹13,182 / sq.yd',
    rateValue: 13182,
    infra: 58,
    legal: 'Conversion pending',
    legalClear: false,
    appreciation: 71,
    metro: '9.2 km',
    metroValue: 9.2,
    bestMatch: false,
  },
]

const ROWS = [
  { key: 'price', label: 'Price', get: (p) => p.price, best: 'min', valueKey: 'priceValue' },
  { key: 'area', label: 'Area', get: (p) => p.area, best: 'max', valueKey: 'areaValue' },
  { key: 'rate', label: 'Rate / sq.yd', get: (p) => p.rate, best: 'min', valueKey: 'rateValue' },
  { key: 'infra', label: 'Infra score', get: (p) => `${p.infra}/100`, best: 'max', valueKey: 'infra' },
  {
    key: 'legal',
    label: 'Legal status',
    get: (p) => p.legal,
    best: 'clear',
    valueKey: 'legalClear',
  },
  {
    key: 'appreciation',
    label: 'Appreciation potential',
    get: (p) => `${p.appreciation}/100`,
    best: 'max',
    valueKey: 'appreciation',
  },
  {
    key: 'metro',
    label: 'Metro distance',
    get: (p) => p.metro,
    best: 'min',
    valueKey: 'metroValue',
  },
]

const MAX_PINNED = 3

function isBestValue(row, plot, plots) {
  if (row.best === 'clear') return plot.legalClear
  const values = plots.map((p) => p[row.valueKey])
  if (row.best === 'min') return plot[row.valueKey] === Math.min(...values)
  if (row.best === 'max') return plot[row.valueKey] === Math.max(...values)
  return false
}

export default function PlotCompare() {
  const [pinnedIds, setPinnedIds] = useState(['a12', 'b7', 'c3'])

  const pinned = useMemo(
    () => pinnedIds.map((id) => PLOTS.find((p) => p.id === id)).filter(Boolean),
    [pinnedIds],
  )

  function togglePin(id) {
    setPinnedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev
        return prev.filter((item) => item !== id)
      }
      if (prev.length >= MAX_PINNED) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }

  return (
    <section className="plot-compare" id="compare-plots" aria-label="Compare plots">
      <div className="plot-compare__frame">
        <header className="plot-compare__intro">
          <p className="plot-compare__eyebrow">New — Idea 6</p>
          <h2 className="plot-compare__heading">
            Compare plots
            <br />
            side by side.
          </h2>
          <p className="plot-compare__lede">
            Shortlist up to 3 plots and compare everything that matters — price per sq.yd,
            infra score, legal status, appreciation potential. Converts browsers into callers.
          </p>
        </header>

        <div className="plot-compare__picker" aria-label="Pin plots to compare">
          <p className="plot-compare__picker-label">
            Pin 2–3 plots
            <span>
              {pinned.length}/{MAX_PINNED} selected
            </span>
          </p>
          <div className="plot-compare__chips">
            {PLOTS.map((plot) => {
              const isPinned = pinnedIds.includes(plot.id)
              return (
                <button
                  key={plot.id}
                  type="button"
                  className={`plot-compare__chip${isPinned ? ' is-pinned' : ''}`}
                  aria-pressed={isPinned}
                  onClick={() => togglePin(plot.id)}
                >
                  <span className="plot-compare__chip-pin" aria-hidden="true">
                    {isPinned ? '★' : '☆'}
                  </span>
                  <span className="plot-compare__chip-text">
                    <strong>{plot.code}</strong>
                    <small>{plot.location}</small>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="plot-compare__table-wrap">
          <div
            className="plot-compare__table"
            style={{ '--cols': pinned.length }}
            role="table"
            aria-label="Plot comparison"
          >
          <div className="plot-compare__row plot-compare__row--head" role="row">
            <div className="plot-compare__label-cell" role="columnheader" />
            {pinned.map((plot) => (
              <div
                key={plot.id}
                className={`plot-compare__plot-head${plot.bestMatch ? ' is-best' : ''}`}
                role="columnheader"
              >
                {plot.bestMatch ? (
                  <span className="plot-compare__badge">Best match</span>
                ) : (
                  <span className="plot-compare__badge plot-compare__badge--ghost">Pinned</span>
                )}
                <p className="plot-compare__plot-code">{plot.code}</p>
                <p className="plot-compare__plot-loc">{plot.location}</p>
              </div>
            ))}
          </div>

          {ROWS.map((row) => (
            <div key={row.key} className="plot-compare__row" role="row">
              <div className="plot-compare__label-cell" role="rowheader">
                {row.label}
              </div>
              {pinned.map((plot) => {
                const best = isBestValue(row, plot, pinned)
                return (
                  <div
                    key={`${row.key}-${plot.id}`}
                    className={`plot-compare__value${best ? ' is-best' : ''}${
                      row.key === 'legal' && !plot.legalClear ? ' is-warn' : ''
                    }`}
                    role="cell"
                  >
                    {row.key === 'infra' || row.key === 'appreciation' ? (
                      <div className="plot-compare__score">
                        <span>{row.get(plot)}</span>
                        <span
                          className="plot-compare__meter"
                          aria-hidden="true"
                        >
                          <span
                            style={{
                              width: `${plot[row.valueKey]}%`,
                            }}
                          />
                        </span>
                      </div>
                    ) : (
                      row.get(plot)
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          <div className="plot-compare__row plot-compare__row--cta" role="row">
            <div className="plot-compare__label-cell" />
            {pinned.map((plot) => (
              <div key={`cta-${plot.id}`} className="plot-compare__cta-cell">
                <a className="plot-compare__cta" href="#contact">
                  Enquire on {plot.code}
                </a>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}
