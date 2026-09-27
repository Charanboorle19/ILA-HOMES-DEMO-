import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { properties } from '../data/properties'
import SmartFilters from '../components/SmartFilters/SmartFilters'
import SimilarProperties from '../components/SimilarProperties/SimilarProperties'
import {
  applyFilters,
  createDefaultFilters,
  isHeavyFilterSet,
} from '../lib/filters'
import { formatPrice } from '../lib/format'
import { getSimilarProperties } from '../lib/similar'
import { addInterest } from '../lib/visitor'
import { checkSavedSearchesAgainstProperties } from '../lib/savedSearches'
import { computeConnectivityScore } from '../lib/connectivity'
import './PropertiesPage.css'

const ACCENTS = [
  'linear-gradient(145deg, #e8ede9, #d4ddd6)',
  'linear-gradient(145deg, #ebe6dc, #ddd4c4)',
  'linear-gradient(145deg, #e4e8ef, #cfd6e2)',
  'linear-gradient(145deg, #ebe3e0, #ddd0cb)',
  'linear-gradient(145deg, #e3ebe8, #c9d8d1)',
  'linear-gradient(145deg, #ebe8e0, #d8d2c4)',
]

export default function PropertiesPage() {
  const [filters, setFilters] = useState(() => createDefaultFilters())

  const filtered = useMemo(
    () => applyFilters(properties, filters),
    [filters],
  )

  const heavy = isHeavyFilterSet(filters)

  const filterBiasSimilar = useMemo(() => {
    if (!heavy || filtered.length === 0) return []
    const seed = filtered[0]
    return getSimilarProperties(seed, properties, {
      limit: 4,
      preferenceBias: filters,
    }).filter((item) => !filtered.some((p) => p.id === item.property.id))
  }, [filtered, filters, heavy])

  useEffect(() => {
    // Demo: run saved-search matcher when catalogue is viewed
    checkSavedSearchesAgainstProperties(properties)
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem('ila_active_filters', JSON.stringify(filters))
    } catch {
      /* ignore */
    }
  }, [filters])

  useEffect(() => {
    if (heavy) addInterest('heavy_filter', 1)
  }, [heavy])

  function handleFilterChange(next) {
    setFilters(next)
  }

  return (
    <section className="props-page" aria-labelledby="props-page-heading">
      <div className="props-page__frame">
        <header className="props-page__intro">
          <p className="props-page__eyebrow">Properties</p>
          <h1 id="props-page-heading" className="props-page__heading">
            Verified layouts across
            <br />
            South Hyderabad.
          </h1>
          <p className="props-page__lede">
            Filter by price, size, facing, road width, and highway distance —
            then save the search and get WhatsApp alerts when something new matches.
          </p>
        </header>

        <SmartFilters
          properties={properties}
          filters={filters}
          onChange={handleFilterChange}
          resultCount={filtered.length}
        />

        {filtered.length === 0 ? (
          <div className="props-page__empty" role="status">
            <p className="props-page__empty-title">No plots match these filters</p>
            <p className="props-page__empty-copy">
              Loosen price or area, or save this search to get notified when inventory opens up.
            </p>
          </div>
        ) : (
          <div className="props-page__grid">
            {filtered.map((property, index) => {
              const score = computeConnectivityScore(property)
              return (
                <article key={property.id} className="props-card">
                  <Link
                    to={`/properties/${property.id}`}
                    className="props-card__link"
                  >
                    <div
                      className="props-card__media"
                      style={{ background: ACCENTS[index % ACCENTS.length] }}
                      aria-hidden="true"
                    >
                      <span className="props-card__tag">{property.approval}</span>
                      {property.status === 'booked' ? (
                        <span className="props-card__status">Booked</span>
                      ) : null}
                      <span className="props-card__media-label">{property.name}</span>
                      <span className="props-card__score" title={score.badge}>
                        {score.total}
                      </span>
                    </div>
                    <div className="props-card__body">
                      <h2 className="props-card__name">{property.name}</h2>
                      <p className="props-card__location">{property.location}</p>
                      <dl className="props-card__meta">
                        <div>
                          <dt>Size</dt>
                          <dd>{property.sqYards}</dd>
                        </div>
                        <div>
                          <dt>Facing</dt>
                          <dd>
                            {property.facing}
                            {property.corner ? ' · Corner' : ''}
                          </dd>
                        </div>
                        <div>
                          <dt>Price</dt>
                          <dd className="props-card__price">
                            {formatPrice(property.price)}
                          </dd>
                        </div>
                      </dl>
                      <div className="props-card__flags">
                        {property.parkFacing ? <span>Park facing</span> : null}
                        {property.reraRegistered ? <span>RERA</span> : null}
                        {property.bankEligible ? <span>Bank eligible</span> : null}
                        <span>{property.roadWidth} road</span>
                      </div>
                      <span className="props-card__cta">View property →</span>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {filterBiasSimilar.length > 0 ? (
        <SimilarProperties
          items={filterBiasSimilar}
          title="Close to what you’re filtering for"
        />
      ) : null}
    </section>
  )
}
