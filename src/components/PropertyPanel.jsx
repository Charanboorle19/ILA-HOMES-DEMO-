import { Link } from 'react-router-dom'
import { properties } from '../data/properties'
import {
  computeConnectivityScore,
  getNearestAmenities,
} from '../lib/connectivity'
import './PropertyPanel.css'

const STATUS_CLASS = {
  'Ready to Register': 'ready-to-register',
  'Open for Booking': 'open-for-booking',
  'Limited Plots': 'limited-plots',
  'Fast Moving': 'fast-moving',
  'Almost Sold Out': 'almost-sold-out',
  'Updating Soon': 'updating-soon',
  Viewing: 'viewing',
  Booked: 'booked',
}

export default function PropertyPanel({
  property,
  onClose,
  autoSelecting = false,
  autoIndex = 0,
  autoTotal = 0,
  sheet = false,
}) {
  const isActive = Boolean(property)
  const stepLabel = `${String(autoIndex + 1).padStart(2, '0')} / ${String(autoTotal).padStart(2, '0')}`
  const detail = property
    ? properties.find((item) => item.id === property.id)
    : null
  const score = detail ? computeConnectivityScore(detail) : null
  const nearest = detail ? getNearestAmenities(detail, 5) : []

  return (
    <aside
      className={[
        'property-panel',
        isActive ? 'is-active' : '',
        autoSelecting ? 'is-auto' : '',
        sheet ? 'property-panel--sheet' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!isActive}
      aria-live="polite"
    >
      {property ? (
        <>
          <button
            type="button"
            className="property-panel__close"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onClose?.()
            }}
            aria-label="Close property details"
          >
            ×
          </button>

          <div key={property.id} className="property-panel__scroll">
            {autoSelecting ? (
              <div className="property-panel__auto property-panel__block" aria-label="Auto selecting layouts">
                <span className="property-panel__auto-pulse" aria-hidden="true" />
                <span className="property-panel__auto-label">Auto selecting</span>
                <span className="property-panel__auto-step">{stepLabel}</span>
              </div>
            ) : null}

            <div className="property-panel__header property-panel__block">
              <p className="property-panel__location">
                <span className="property-panel__dot" aria-hidden="true" />
                {property.mapsUrl ? (
                  <a
                    className="property-panel__maps-link"
                    href={property.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📍 {property.location}
                  </a>
                ) : (
                  property.location
                )}
              </p>
            </div>

            <div className="property-panel__media property-panel__block">
              {property.image ? (
                <img
                  className="property-panel__media-img"
                  src={property.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="property-panel__media-placeholder" aria-hidden="true" />
              )}
              <h2 className="property-panel__media-title">{property.label}</h2>
            </div>

            <div className="property-panel__price property-panel__block">
              <div className="property-panel__price-copy">
                <span>Rate</span>
                <strong>{property.priceRange}</strong>
              </div>
              <span
                className={`property-panel__status-pill property-panel__status-pill--${STATUS_CLASS[property.status] ?? 'limited-plots'}`}
              >
                {property.status}
              </span>
            </div>

            <section className="property-panel__details property-panel__block" aria-label="Plot details">
              <h3 className="property-panel__section-title">Details</h3>
              <dl className="property-panel__facts">
                {property.plotNumber != null ? (
                  <div className="property-panel__fact">
                    <dt>Plot</dt>
                    <dd>{property.plotNumber}</dd>
                  </div>
                ) : null}
                <div className="property-panel__fact">
                  <dt>Area</dt>
                  <dd>{property.plotSizes}</dd>
                </div>
                <div className="property-panel__fact">
                  <dt>Facing</dt>
                  <dd>{property.facing}</dd>
                </div>
                <div className="property-panel__fact">
                  <dt>Road</dt>
                  <dd>{property.road}</dd>
                </div>
                {property.plotNumber == null ? (
                  <div className="property-panel__fact">
                    <dt>Plots</dt>
                    <dd>{property.plots}</dd>
                  </div>
                ) : null}
                <div className="property-panel__fact property-panel__fact--wide">
                  <dt>Water</dt>
                  <dd>{property.water}</dd>
                </div>
                <div className="property-panel__fact property-panel__fact--wide">
                  <dt>Power</dt>
                  <dd>{property.power}</dd>
                </div>
              </dl>
              {property.highlight ? (
                <p className="property-panel__highlight">
                  <span className="property-panel__accent" aria-hidden="true" />
                  {property.highlight}
                </p>
              ) : null}
            </section>

            {score ? (
              <section className="property-panel__connect property-panel__block" aria-label="Location score">
                <div className="property-panel__connect-head">
                  <div>
                    <p className="property-panel__connect-label">Location score</p>
                    <p className="property-panel__connect-badge">{score.badge}</p>
                  </div>
                  <strong className="property-panel__connect-score">{score.total}</strong>
                </div>
                <ul className="property-panel__amenities">
                  {nearest.map((item) => (
                    <li key={item.id}>
                      <span>{item.name}</span>
                      <strong>{item.distance ?? `${item.distanceKm} km`}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {property.mapsUrl ? (
              <a
                className="property-panel__location-card property-panel__block"
                href={property.mapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="property-panel__location-card-label">📍 Location</span>
                <span className="property-panel__location-card-text">
                  Open in Google Maps
                </span>
              </a>
            ) : null}
          </div>

          <div className="property-panel__cta-wrap property-panel__block">
            <Link
              className="property-panel__cta"
              to={`/properties/${property.id}`}
            >
              Visit Property
            </Link>
          </div>
        </>
      ) : null}
    </aside>
  )
}
