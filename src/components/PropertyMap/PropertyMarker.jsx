export default function PropertyMarker({
  property,
  selected = false,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`pm-marker ${selected ? 'is-selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(property)
      }}
      aria-label={`${property.title}, ${property.price}`}
    >
      <span className="pm-marker__price">{property.priceShort}</span>
      <span className="pm-marker__dot" aria-hidden="true" />
      <span className="pm-marker__name">{property.title}</span>
    </button>
  )
}
