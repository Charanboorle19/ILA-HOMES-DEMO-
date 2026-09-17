import Reveal from './Reveal'
import { properties } from '../data/site'

export default function Properties() {
  return (
    <section className="section properties" id="properties">
      <div className="section__intro">
        <Reveal>
          <h2 className="section__title">Properties worth exploring</h2>
        </Reveal>
      </div>

      <div className="properties__grid">
        {properties.map((property, index) => (
          <Reveal key={property.id} delay={index * 80} className="property-card">
            <article>
              <div className="media-frame media-frame--tall">
                <img
                  src={property.image}
                  alt=""
                  width={800}
                  height={600}
                  loading="lazy"
                />
              </div>
              <div className="property-card__body">
                <p className="property-card__label">{property.label}</p>
                <h3>{property.location}</h3>
                <dl className="property-card__meta">
                  <div>
                    <dt className="sr-only">Size</dt>
                    <dd>{property.size}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Status</dt>
                    <dd>{property.status}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Price</dt>
                    <dd className="property-card__price">{property.price}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
