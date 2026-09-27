/** Format INR price for display (e.g. ₹32L, ₹1.12 Cr). */
export function formatPrice(price) {
  if (price == null || Number.isNaN(price)) return '—'
  if (price >= 10000000) {
    const cr = price / 10000000
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`
  }
  const lakhs = price / 100000
  return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)} L`
}

/** Format area for display. */
export function formatArea(sqFt) {
  if (sqFt == null) return '—'
  return `${Math.round(sqFt).toLocaleString('en-IN')} sq.ft`
}

/** Parse road width string like "40 ft" → 40. */
export function parseRoadWidthFt(roadWidth) {
  if (typeof roadWidth === 'number') return roadWidth
  if (!roadWidth) return 0
  const match = String(roadWidth).match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

/** Parse distance string like "2.4 km" → 2.4. */
export function parseDistanceKm(distance) {
  if (typeof distance === 'number') return distance
  if (!distance) return Infinity
  const match = String(distance).match(/([\d.]+)/)
  return match ? Number(match[1]) : Infinity
}
