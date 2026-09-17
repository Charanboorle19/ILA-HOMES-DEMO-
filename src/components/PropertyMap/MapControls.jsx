export default function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onSouthHyderabad,
}) {
  return (
    <div className="map-controls" role="group" aria-label="Map controls">
      <button type="button" className="map-controls__chip" onClick={onSouthHyderabad}>
        South Hyderabad
      </button>

      <div className="map-controls__stack">
        <button type="button" onClick={onZoomIn} aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={onZoomOut} aria-label="Zoom out">
          −
        </button>
        <button type="button" onClick={onReset} aria-label="Reset to Hyderabad view">
          ⌂
        </button>
      </div>
    </div>
  )
}
