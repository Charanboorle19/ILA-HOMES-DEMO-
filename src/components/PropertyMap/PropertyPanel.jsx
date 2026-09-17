export default function PropertyPanel({ property, onClose, onView }) {
  if (!property) return null

  return (
    <aside className="map-panel map-panel--property" aria-live="polite">
      <button
        type="button"
        className="map-panel__close"
        onClick={onClose}
        aria-label="Close property details"
      >
        ×
      </button>

      <p className="map-panel__eyebrow">{property.demoNote}</p>
      <h3 className="map-panel__title">{property.title}</h3>
      <p className="map-panel__location">{property.location}</p>

      <ul className="map-panel__facts">
        <li>{property.area}</li>
        {property.facing ? <li>{property.facing}</li> : null}
        <li>{property.approval}</li>
      </ul>

      <p className="map-panel__price">{property.price}</p>

      <button
        type="button"
        className="btn btn--solid map-panel__cta"
        onClick={() => onView?.(property)}
      >
        View Property
      </button>
    </aside>
  )
}
