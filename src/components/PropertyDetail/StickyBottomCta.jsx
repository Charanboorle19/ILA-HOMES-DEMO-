import { useEffect, useState } from 'react'
import './StickyBottomCta.css'

export default function StickyBottomCta({ property, heroRef }) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(false)
  }, [property.id])

  useEffect(() => {
    const hero = heroRef?.current
    if (!hero) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0.15 },
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [heroRef, property.id])

  if (dismissed || !visible) return null

  const whatsappText = encodeURIComponent(
    `Hi ILA Homes, I'd like to schedule a site visit for ${property.name}.`,
  )

  return (
    <div className="pd-sticky" id="pd-sticky-cta" role="region" aria-label="Site visit call to action">
      <div className="pd-sticky__inner">
        <p className="pd-sticky__copy">Ready to see this plot in person?</p>
        <div className="pd-sticky__actions">
          <a className="pd-btn pd-btn--solid" href="mailto:hello@ilahomes.example?subject=Site%20Visit">
            Schedule a Site Visit
          </a>
          <a
            className="pd-btn pd-btn--accent"
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Us
          </a>
        </div>
        <button
          type="button"
          className="pd-sticky__close"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
        >
          ×
        </button>
      </div>
    </div>
  )
}
