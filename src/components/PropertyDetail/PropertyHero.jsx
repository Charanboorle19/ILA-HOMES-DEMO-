import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import mainPhoto from '../../assets/G1.webp'
import thumbDrone from '../../assets/extra-image-3.png'
import thumbView from '../../assets/extra-image-4.png'
import thumbSite from '../../assets/extra-image-5.png'
import sarkGreen1 from '../../assets/Sark Green Plains-1.png'
import sarkGreen2 from '../../assets/Sark Green Plains-2.png'
import sarkGreen3 from '../../assets/Sark Green Plains-3.png'
import { computeConnectivityScore } from '../../lib/connectivity'
import { formatPrice } from '../../lib/format'
import './PropertyHero.css'

const DEFAULT_GALLERY = [
  { id: 'main', src: mainPhoto, label: 'Entrance gate' },
  { id: 'drone', src: thumbDrone, label: 'Site view' },
  { id: 'plot', src: thumbView, label: 'Plot view' },
  { id: 'open', src: thumbSite, label: 'Open land' },
]

const SARK_GREEN_GALLERY = [
  { id: 'overview', src: sarkGreen1, label: 'Site overview' },
  { id: 'landscape', src: sarkGreen2, label: 'Landscaped plots' },
  { id: 'roads', src: sarkGreen3, label: 'Layout roads' },
]

function getGalleryForProperty(propertyId) {
  if (propertyId === 'sark-green-plains') return SARK_GREEN_GALLERY
  return DEFAULT_GALLERY
}

export default function PropertyHero({ property, heroRef }) {
  const gallery = useMemo(
    () => getGalleryForProperty(property?.id),
    [property?.id],
  )
  const [activeId, setActiveId] = useState(gallery[0].id)

  useEffect(() => {
    setActiveId(gallery[0].id)
  }, [gallery])

  const active = gallery.find((item) => item.id === activeId) ?? gallery[0]
  const thumbs = gallery.filter((item) => item.id !== activeId).slice(0, 3)
  const score = computeConnectivityScore(property)

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
            <span className="pd-hero__score" title={score.badge}>
              <strong>{score.total}</strong>
              <span>Location</span>
            </span>
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
