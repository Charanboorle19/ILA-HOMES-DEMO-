import { Link } from 'react-router-dom'
import './PropertyPanel.css'

const STATUS_CLASS = {
  'Ready to Register': 'ready-to-register',
  'Open for Booking': 'open-for-booking',
  'Limited Plots': 'limited-plots',
  'Fast Moving': 'fast-moving',
  'Almost Sold Out': 'almost-sold-out',
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
              <span className="property-panel__tag">{property.tag}</span>
              <p className="property-panel__location">
                <span className="property-panel__dot" aria-hidden="true" />
                {property.location}
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
                <span>Price Range</span>
                <strong>{property.priceRange}</strong>
              </div>
              <Link
                className="property-panel__view"
                to={`/properties/${property.id}`}
              >
                View
                <svg
                  className="property-panel__view-arrow"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 8h9M8.5 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            <div className="property-panel__divider" aria-hidden="true" />

            <dl className="property-panel__specs property-panel__block">
              <div>
                <dt>Plot Sizes</dt>
                <dd>{property.plotSizes}</dd>
              </div>
              <div>
                <dt>Total Plots</dt>
                <dd>{property.plots}</dd>
              </div>
              <div>
                <dt>Facing</dt>
                <dd>{property.facing}</dd>
              </div>
              <div>
                <dt>Road Width</dt>
                <dd>{property.road}</dd>
              </div>
              <div>
                <dt>Water Supply</dt>
                <dd>{property.water}</dd>
              </div>
              <div>
                <dt>Power Supply</dt>
                <dd>{property.power}</dd>
              </div>
            </dl>

            <div className="property-panel__divider" aria-hidden="true" />

            <p className="property-panel__highlight property-panel__block">
              <span className="property-panel__accent" aria-hidden="true" />
              {property.highlight}
            </p>

            <div className="property-panel__status property-panel__block">
              <span
                className={`property-panel__status-pill property-panel__status-pill--${STATUS_CLASS[property.status] ?? 'limited-plots'}`}
              >
                {property.status}
              </span>
            </div>
          </div>

          <div className="property-panel__cta-wrap property-panel__block">
            <button type="button" className="property-panel__cta">
              Request Site Visit
            </button>
          </div>
        </>
      ) : null}
    </aside>
  )
}
