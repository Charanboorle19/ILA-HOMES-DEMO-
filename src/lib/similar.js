import { getViewedPropertyIds, getWishlistIds } from './visitor'

/**
 * Score how similar candidate is to the seed property.
 * Higher = more similar. Returns { score, reasons[] }.
 */
function scoreSimilar(seed, candidate, preferenceBias = null) {
  const reasons = []
  let score = 0

  const seedLoc = (seed.locationKey || seed.location || '').toLowerCase()
  const candLoc = (candidate.locationKey || candidate.location || '').toLowerCase()
  const sameLocality =
    seedLoc &&
    candLoc &&
    (candLoc.includes(seedLoc.split(',')[0]) ||
      seedLoc.includes(candLoc.split(',')[0]) ||
      seed.locationKey === candidate.locationKey)

  if (sameLocality) {
    score += 40
    reasons.push({ id: 'locality', label: 'Same locality' })
  }

  const priceDelta =
    Math.abs((candidate.price ?? 0) - (seed.price ?? 0)) / Math.max(seed.price ?? 1, 1)
  if (priceDelta <= 0.2) {
    score += 25
    reasons.push({
      id: 'price',
      label:
        (candidate.price ?? 0) < (seed.price ?? 0)
          ? 'Similar price · cheaper'
          : 'Similar price',
    })
  } else if (priceDelta <= 0.35) {
    score += 12
  }

  const areaDelta =
    Math.abs((candidate.areaSqFt ?? 0) - (seed.areaSqFt ?? 0)) /
    Math.max(seed.areaSqFt ?? 1, 1)
  if (areaDelta <= 0.2) {
    score += 20
    reasons.push({
      id: 'area',
      label:
        (candidate.areaSqFt ?? 0) > (seed.areaSqFt ?? 0)
          ? 'Larger plot'
          : 'Similar area',
    })
  } else if (areaDelta <= 0.35) {
    score += 8
  }

  if (
    (candidate.propertyType ?? 'Plot') === (seed.propertyType ?? 'Plot')
  ) {
    score += 12
    reasons.push({ id: 'type', label: 'Same type' })
  }

  const seedFeatures = new Set(seed.features ?? [])
  const overlap = (candidate.features ?? []).filter((f) => seedFeatures.has(f))
  if (overlap.length) {
    score += Math.min(15, overlap.length * 5)
  }

  const sameFacing =
    seed.facing &&
    candidate.facing &&
    seed.facing.toLowerCase() === candidate.facing.toLowerCase()
  if (sameFacing) {
    score += 10
    reasons.push({ id: 'facing', label: 'Same facing' })
  } else if (candidate.corner && !seed.corner) {
    score += 6
    reasons.push({ id: 'corner', label: 'Better facing · corner' })
  }

  if (candidate.parkFacing && !seed.parkFacing) {
    reasons.push({ id: 'park', label: 'Park facing' })
    score += 4
  }

  // Bias toward active filters / saved search preferences
  if (preferenceBias) {
    if (
      preferenceBias.facing?.length &&
      preferenceBias.facing.some((f) =>
        (candidate.facing || '').toLowerCase().includes(f.toLowerCase()),
      )
    ) {
      score += 8
    }
    if (preferenceBias.cornerOnly && candidate.corner) score += 6
    if (
      preferenceBias.propertyTypes?.length &&
      preferenceBias.propertyTypes.includes(candidate.propertyType)
    ) {
      score += 5
    }
  }

  // Deduplicate reason labels preferring first
  const seen = new Set()
  const uniqueReasons = reasons.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })

  return { score, reasons: uniqueReasons.slice(0, 3) }
}

/**
 * Find similar properties for a seed listing.
 * @param {object} seed
 * @param {object[]} catalogue
 * @param {{ limit?: number, preferenceBias?: object|null }} [options]
 */
export function getSimilarProperties(seed, catalogue, options = {}) {
  const limit = options.limit ?? 6
  const preferenceBias = options.preferenceBias ?? null
  const viewed = new Set(getViewedPropertyIds())
  const wishlist = new Set(getWishlistIds())

  return catalogue
    .filter((item) => item.id !== seed.id)
    .filter((item) => (item.status ?? 'available') === 'available')
    .map((item) => {
      const { score, reasons } = scoreSimilar(seed, item, preferenceBias)
      // Soft-penalize already viewed / wishlisted (still allow)
      let adjusted = score
      if (viewed.has(item.id)) adjusted -= 4
      if (wishlist.has(item.id)) adjusted -= 8
      return { property: item, score: adjusted, reasons }
    })
    .filter((item) => item.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
