export default function LocationPanel({ location, onClose, onExplore }) {
  if (!location) return null

  return (
    <aside className="map-panel map-panel--location" aria-live="polite">
      <button
        type="button"
        className="map-panel__close"
        onClick={onClose}
        aria-label="Close location details"
      >
        ×
      </button>

      <p className="map-panel__eyebrow">{location.demoNote}</p>
      <h3 className="map-panel__title">{location.name}</h3>
      <p className="map-panel__text">{location.description}</p>

      <button
        type="button"
        className="btn btn--ghost map-panel__cta"
        onClick={() => onExplore?.(location)}
      >
        Explore Properties
      </button>
    </aside>
  )
}
