import { Link } from 'react-router-dom'
import { properties } from '../data/properties'
import './PropertiesPage.css'

const ACCENTS = [
  'linear-gradient(145deg, #e8ede9, #d4ddd6)',
  'linear-gradient(145deg, #ebe6dc, #ddd4c4)',
  'linear-gradient(145deg, #e4e8ef, #cfd6e2)',
  'linear-gradient(145deg, #ebe3e0, #ddd0cb)',
  'linear-gradient(145deg, #e3ebe8, #c9d8d1)',
  'linear-gradient(145deg, #ebe8e0, #d8d2c4)',
]

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  return `₹${(price / 100000).toFixed(price >= 1000000 ? 1 : 0)} L`
}

export default function PropertiesPage() {
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
            Browse every demo layout on one page. Open any property for full
            details — same template for each listing.
          </p>
        </header>

        <div className="props-page__grid">
          {properties.map((property, index) => (
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
                  <span className="props-card__media-label">{property.name}</span>
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
                      <dd>{property.facing}</dd>
                    </div>
                    <div>
                      <dt>Price</dt>
                      <dd className="props-card__price">{formatPrice(property.price)}</dd>
                    </div>
                  </dl>
                  <span className="props-card__cta">View property →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
