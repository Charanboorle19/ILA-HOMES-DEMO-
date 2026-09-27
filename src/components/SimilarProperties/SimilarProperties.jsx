import { Link } from 'react-router-dom'
import { formatPrice } from '../../lib/format'
import './SimilarProperties.css'

const ACCENTS = [
  'linear-gradient(145deg, #e8ede9, #d4ddd6)',
  'linear-gradient(145deg, #ebe6dc, #ddd4c4)',
  'linear-gradient(145deg, #e4e8ef, #cfd6e2)',
  'linear-gradient(145deg, #ebe3e0, #ddd0cb)',
  'linear-gradient(145deg, #e3ebe8, #c9d8d1)',
  'linear-gradient(145deg, #ebe8e0, #d8d2c4)',
]

export default function SimilarProperties({ items, title = 'You may also like' }) {
  if (!items?.length) return null

  return (
    <section className="similar" aria-labelledby="similar-heading">
      <div className="similar__frame">
        <header className="similar__intro">
          <p className="similar__eyebrow">Similar properties</p>
          <h2 id="similar-heading" className="similar__heading">
            {title}
          </h2>
          <p className="similar__lede">
            Same corridor energy — adjusted for price, size, and facing so you can
            compare without starting over.
          </p>
        </header>

        <div className="similar__rail" role="list">
          {items.map(({ property, reasons }, index) => (
            <article
              key={property.id}
              className="similar__card"
              role="listitem"
              style={{ '--i': index }}
            >
              <Link to={`/properties/${property.id}`} className="similar__link">
                <div
                  className="similar__media"
                  style={{
                    background: property.image
                      ? `center / cover no-repeat url(${property.image})`
                      : ACCENTS[index % ACCENTS.length],
                  }}
                  aria-hidden="true"
                >
                  <span className="similar__tag">{property.approval}</span>
                </div>
                <div className="similar__body">
                  <h3 className="similar__name">{property.name}</h3>
                  <p className="similar__loc">{property.location}</p>
                  <dl className="similar__meta">
                    <div>
                      <dt>Size</dt>
                      <dd>{property.sqYards}</dd>
                    </div>
                    <div>
                      <dt>Facing</dt>
                      <dd>{property.facing}</dd>
                    </div>
                    <div>
                      <dt>Price</dt>
                      <dd className="similar__price">{formatPrice(property.price)}</dd>
                    </div>
                  </dl>
                  {reasons?.length ? (
                    <div className="similar__reasons" aria-label="Why similar">
                      {reasons.map((reason) => (
                        <span key={reason.id} className="similar__reason">
                          {reason.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
