export default function LocationMarker({
  location,
  selected = false,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`lm-marker ${selected ? 'is-selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(location)
      }}
      aria-label={`Focus ${location.name}`}
    >
      <span className="lm-marker__ring" aria-hidden="true" />
      <span className="lm-marker__label">{location.name}</span>
    </button>
  )
}
