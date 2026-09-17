import { useEffect, useState } from 'react'
import './PropertyFinalCta.css'

function loadFlag(key, propertyId) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return Boolean(parsed?.[propertyId])
  } catch {
    return false
  }
}

function saveFlag(key, propertyId, value) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : {}
    parsed[propertyId] = value
    localStorage.setItem(key, JSON.stringify(parsed))
  } catch {
    /* ignore storage errors in demo */
  }
}

export default function PropertyFinalCta({ property }) {
  const [wishlisted, setWishlisted] = useState(() =>
    loadFlag('ila-wishlist', property.id),
  )
  const [interested, setInterested] = useState(() =>
    loadFlag('ila-interested', property.id),
  )
  const [shareNote, setShareNote] = useState('')

  useEffect(() => {
    setWishlisted(loadFlag('ila-wishlist', property.id))
    setInterested(loadFlag('ila-interested', property.id))
    setShareNote('')
  }, [property.id])

  const pageUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://ilahomes.example/properties/${property.id}`

  const enquireText = encodeURIComponent(
    `Hi ILA Homes, I'm interested in ${property.name} (${property.location}).`,
  )
  const visitText = encodeURIComponent(
    `Hi ILA Homes, I'd like to schedule a site visit for ${property.name}.`,
  )
  const shareText = `Check out ${property.name} on ILA Homes — ${property.location}\n${pageUrl}`

  function toggleWishlist() {
    setWishlisted((prev) => {
      const next = !prev
      saveFlag('ila-wishlist', property.id, next)
      return next
    })
  }

  function toggleInterested() {
    setInterested((prev) => {
      const next = !prev
      saveFlag('ila-interested', property.id, next)
      return next
    })
  }

  async function shareProperty() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.name,
          text: `Have a look at ${property.name} (${property.location}) on ILA Homes.`,
          url: pageUrl,
        })
        setShareNote('Shared')
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        setShareNote('Link copied')
      } else {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText)}`,
          '_blank',
          'noopener,noreferrer',
        )
        setShareNote('Opened WhatsApp')
      }
    } catch {
      setShareNote('')
    }

    window.setTimeout(() => setShareNote(''), 2200)
  }

  return (
    <section className="pd-section pd-final" aria-labelledby="pd-final-title">
      <div className="pd__frame pd-final__grid">
        <div className="pd-final__copy">
          <p className="pd-eyebrow">Next step</p>
          <h2 id="pd-final-title" className="pd-heading">
            Ready to move on {property.name}?
          </h2>
          <p className="pd-lede">
            Enquire on WhatsApp, schedule a site visit, share this property with
            family, or mark it for later.
          </p>
        </div>

        <div className="pd-final__panel">
          <div className="pd-final__prefs" role="group" aria-label="Save options">
            <button
              type="button"
              className={`pd-final__chip${wishlisted ? ' is-on' : ''}`}
              aria-pressed={wishlisted}
              onClick={toggleWishlist}
            >
              <span aria-hidden="true">{wishlisted ? '♥' : '♡'}</span>
              Wishlist
            </button>
            <button
              type="button"
              className={`pd-final__chip${interested ? ' is-on' : ''}`}
              aria-pressed={interested}
              onClick={toggleInterested}
            >
              <span aria-hidden="true">{interested ? '●' : '○'}</span>
              Interested
            </button>
          </div>

          <div className="pd-final__actions">
            <a
              className="pd-btn pd-btn--accent"
              href={`https://wa.me/?text=${enquireText}`}
              target="_blank"
              rel="noreferrer"
            >
              Enquire on WhatsApp
            </a>
            <a
              className="pd-btn pd-btn--solid"
              href={`https://wa.me/?text=${visitText}`}
              target="_blank"
              rel="noreferrer"
            >
              Schedule a Site Visit
            </a>
            <button
              type="button"
              className="pd-btn pd-btn--ghost"
              onClick={shareProperty}
            >
              {shareNote || 'Share property'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
