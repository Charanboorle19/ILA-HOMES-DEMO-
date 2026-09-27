import { parseDistanceKm } from './format'

export const CONNECTIVITY_WEIGHTS = {
  highway: 25,
  transport: 20,
  schools: 15,
  hospitals: 15,
  dailyNeeds: 15,
  parks: 10,
}

export const CONNECTIVITY_LABELS = {
  highway: 'Highway / main road',
  transport: 'Public transport',
  schools: 'Schools within 3 km',
  hospitals: 'Hospitals within 5 km',
  dailyNeeds: 'Daily needs (market)',
  parks: 'Parks / open space',
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

/** Score a single distance factor (closer = higher). */
function distanceScore(km, goodKm, maxKm) {
  if (!Number.isFinite(km)) return 20
  if (km <= goodKm) return 100
  if (km >= maxKm) return 15
  const t = (km - goodKm) / (maxKm - goodKm)
  return Math.round(100 - t * 85)
}

/**
 * Compute connectivity score 0–100 from curated amenities.
 * Prefer stored `connectivityScore` when present; otherwise derive.
 */
export function computeConnectivityScore(property) {
  if (property.connectivityScore?.total != null) {
    return property.connectivityScore
  }

  const amenities = property.nearbyAmenities ?? []
  const byCategory = (cat) =>
    amenities
      .filter((a) => a.category === cat)
      .map((a) => parseDistanceKm(a.distanceKm ?? a.distance))
      .sort((a, b) => a - b)[0]

  const highwayKm =
    property.highwayKm ??
    byCategory('Transport') ??
    parseDistanceKm(
      property.connectivity?.find((c) => c.icon === 'road' || c.id === 'orr')
        ?.distance,
    )

  const transportKm =
    byCategory('Transport') ??
    parseDistanceKm(
      property.connectivity?.find((c) => c.icon === 'metro')?.distance,
    )

  const schoolKm =
    byCategory('Education') ??
    parseDistanceKm(
      property.connectivity?.find((c) => c.icon === 'school')?.distance,
    )

  const hospitalKm =
    byCategory('Healthcare') ??
    parseDistanceKm(
      property.connectivity?.find((c) => c.icon === 'hospital')?.distance,
    )

  const dailyKm = byCategory('Shopping') ?? 4
  const parkKm = byCategory('Recreation') ?? (property.parkFacing ? 0.4 : 5)

  const factors = {
    highway: distanceScore(highwayKm, 2, 8),
    transport: distanceScore(transportKm, 2.5, 8),
    schools: distanceScore(schoolKm, 2, 5),
    hospitals: distanceScore(hospitalKm, 3, 8),
    dailyNeeds: distanceScore(dailyKm, 1.5, 5),
    parks: distanceScore(parkKm, 1, 4),
  }

  let total = 0
  Object.entries(CONNECTIVITY_WEIGHTS).forEach(([key, weight]) => {
    total += (factors[key] / 100) * weight
  })

  return {
    total: clamp(Math.round(total), 0, 100),
    factors,
    badge: scoreBadge(total),
  }
}

export function scoreBadge(total) {
  if (total >= 80) return 'Excellent connectivity'
  if (total >= 65) return 'Good connectivity'
  if (total >= 50) return 'Average connectivity'
  return 'Developing connectivity'
}

/** Nearest amenities sorted by distance, capped. */
export function getNearestAmenities(property, limit = 6) {
  const amenities = [...(property.nearbyAmenities ?? [])]
  if (!amenities.length && property.connectivity) {
    return property.connectivity.slice(0, limit).map((item) => ({
      id: item.id,
      name: item.label,
      category: categoryFromIcon(item.icon),
      distanceKm: parseDistanceKm(item.distance),
      distance: item.distance,
      icon: item.icon,
    }))
  }

  return amenities
    .map((item) => ({
      ...item,
      distanceKm: parseDistanceKm(item.distanceKm ?? item.distance),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}

function categoryFromIcon(icon) {
  if (icon === 'school') return 'Education'
  if (icon === 'hospital') return 'Healthcare'
  if (icon === 'metro' || icon === 'road') return 'Transport'
  if (icon === 'it') return 'Future Development'
  return 'Shopping'
}
