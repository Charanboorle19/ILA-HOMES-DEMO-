import { useState } from 'react'
import { Link } from 'react-router-dom'
import mainPhoto from '../../assets/G1.webp'
import thumbDrone from '../../assets/extra-image-3.png'
import thumbView from '../../assets/extra-image-4.png'
import thumbSite from '../../assets/extra-image-5.png'
import './PropertyHero.css'

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  return `₹${(price / 100000).toFixed(price >= 1000000 ? 1 : 0)} L`
}

const GALLERY = [
  { id: 'main', src: mainPhoto, label: 'Entrance gate' },
  { id: 'drone', src: thumbDrone, label: 'Site view' },
  { id: 'plot', src: thumbView, label: 'Plot view' },
  { id: 'open', src: thumbSite, label: 'Open land' },
]

export default function PropertyHero({ property, heroRef }) {
  const [activeId, setActiveId] = useState(GALLERY[0].id)
  const active = GALLERY.find((item) => item.id === activeId) ?? GALLERY[0]
  const thumbs = GALLERY.filter((item) => item.id !== activeId).slice(0, 3)

  const whatsappText = encodeURIComponent(
    `Hi ILA Homes, I'm interested in ${property.name} (${property.location}).`,
  )

  return (
    <section className="pd-hero pd-section" ref={heroRef} aria-labelledby="pd-hero-title">
      <div className="pd__frame pd-hero__grid">
        <div className="pd-hero__copy">
          <nav className="pd-hero__crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/properties">Properties</Link>
            <span aria-hidden="true">/</span>
            <span>{property.location}</span>
          </nav>

          <h1 id="pd-hero-title" className="pd-hero__title">
            {property.name}
          </h1>
          <p className="pd-hero__tagline">{property.tagline}</p>
          <p className="pd-hero__desc">{property.description}</p>

          <dl className="pd-hero__specs">
            <div>
              <dt>Sq yards</dt>
              <dd>{property.sqYards}</dd>
            </div>
            <div>
              <dt>Facing</dt>
              <dd>{property.facing}</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>{property.dimensions}</dd>
            </div>
            <div>
              <dt>Road width</dt>
              <dd>{property.roadWidth}</dd>
            </div>
          </dl>

          <div className="pd-hero__price-row">
            <p className="pd-hero__price">{formatPrice(property.price)}</p>
            <span className="pd-hero__badge">{property.approval} Approved</span>
          </div>

          <div className="pd-hero__actions">
            <a
              className="pd-btn pd-btn--accent"
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer"
            >
              Enquire on WhatsApp
            </a>
            <a className="pd-btn pd-btn--ghost" href="mailto:hello@ilahomes.example?subject=Site%20Visit">
              Schedule a Site Visit
            </a>
          </div>

          <p className="pd-hero__proof">
            <span className="pd-hero__ping" aria-hidden="true" />
            {property.viewingCount} people viewing · {property.enquiryCount} enquiries today
          </p>
        </div>

        <div className="pd-hero__media">
          <div className="pd-hero__main">
            <img
              src={active.src}
              alt={`${property.name} — ${active.label}`}
              className="pd-hero__img"
            />
          </div>
          <div className="pd-hero__thumbs">
            {thumbs.map((item) => (
              <button
                key={item.id}
                type="button"
                className="pd-hero__thumb"
                onClick={() => setActiveId(item.id)}
                aria-label={`Show ${item.label}`}
              >
                <img
                  src={item.src}
                  alt=""
                  className="pd-hero__img"
                />
                <span className="pd-hero__thumb-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
