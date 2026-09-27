import { parseDistanceKm, parseRoadWidthFt } from './format'

export const PROPERTY_TYPES = ['Plot', 'Villa', 'Apartment']
export const POSSESSION_OPTIONS = [
  { id: 'ready', label: 'Ready' },
  { id: '6m', label: 'Within 6 months' },
  { id: '1y', label: 'Within 1 year' },
  { id: 'later', label: '1 year+' },
]
export const FACING_OPTIONS = ['East', 'North', 'South', 'West', 'Corner']
export const ROAD_WIDTH_OPTIONS = [
  { id: '20', label: '20 ft', min: 20 },
  { id: '30', label: '30 ft', min: 30 },
  { id: '40', label: '40 ft+', min: 40 },
]
export const STATUS_OPTIONS = [
  { id: 'available', label: 'Available' },
  { id: 'booked', label: 'Booked' },
]
export const AMENITY_FEATURE_OPTIONS = [
  { id: 'gated', label: 'Gated' },
  { id: 'park', label: 'Park / open space' },
  { id: 'compound', label: 'Compound wall' },
  { id: 'underground-power', label: 'Underground power' },
  { id: 'water', label: 'Municipal water' },
  { id: 'clubhouse', label: 'Clubhouse' },
]

export const FILTER_BOUNDS = {
  price: { min: 1500000, max: 12000000, step: 100000 },
  areaSqFt: { min: 1200, max: 5500, step: 50 },
  highwayKm: { min: 0, max: 10, step: 0.5 },
}

/** Empty / default filter state (sold/booked hidden by default). */
export function createDefaultFilters() {
  return {
    priceMin: FILTER_BOUNDS.price.min,
    priceMax: FILTER_BOUNDS.price.max,
    areaMin: FILTER_BOUNDS.areaSqFt.min,
    areaMax: FILTER_BOUNDS.areaSqFt.max,
    propertyTypes: [],
    possession: [],
    facing: [],
    roadWidths: [],
    amenities: [],
    statuses: ['available'],
    locations: [],
    cornerOnly: false,
    parkFacingOnly: false,
    bankEligibleOnly: false,
    reraOnly: false,
    highwayMaxKm: null,
  }
}

export function countActiveFilters(filters) {
  const defaults = createDefaultFilters()
  let count = 0
  if (filters.priceMin > defaults.priceMin || filters.priceMax < defaults.priceMax) count += 1
  if (filters.areaMin > defaults.areaMin || filters.areaMax < defaults.areaMax) count += 1
  if (filters.propertyTypes.length) count += 1
  if (filters.possession.length) count += 1
  if (filters.facing.length) count += 1
  if (filters.roadWidths.length) count += 1
  if (filters.amenities.length) count += 1
  if (
    filters.statuses.length !== 1 ||
    filters.statuses[0] !== 'available'
  ) {
    count += 1
  }
  if (filters.locations.length) count += 1
  if (filters.cornerOnly) count += 1
  if (filters.parkFacingOnly) count += 1
  if (filters.bankEligibleOnly) count += 1
  if (filters.reraOnly) count += 1
  if (filters.highwayMaxKm != null) count += 1
  return count
}

export function isHeavyFilterSet(filters) {
  return countActiveFilters(filters) >= 2
}

function matchesFacing(property, selected) {
  if (!selected.length) return true
  const facing = (property.facing || '').toLowerCase()
  const isCorner = Boolean(property.corner)
  return selected.some((option) => {
    if (option === 'Corner') return isCorner
    return facing.includes(option.toLowerCase())
  })
}

function matchesRoadWidth(property, selectedIds) {
  if (!selectedIds.length) return true
  const width = parseRoadWidthFt(property.roadWidth)
  return selectedIds.some((id) => {
    const option = ROAD_WIDTH_OPTIONS.find((item) => item.id === id)
    if (!option) return false
    if (id === '40') return width >= 40
    return width === option.min
  })
}

function matchesAmenities(property, selected) {
  if (!selected.length) return true
  const features = property.features ?? []
  return selected.every((id) => features.includes(id))
}

function highwayDistance(property) {
  if (typeof property.highwayKm === 'number') return property.highwayKm
  const road = (property.connectivity ?? []).find(
    (item) => item.id === 'orr' || item.icon === 'road',
  )
  return road ? parseDistanceKm(road.distance) : Infinity
}

/** Apply smart filters to a property list. */
export function applyFilters(properties, filters) {
  return properties.filter((property) => {
    const price = property.price ?? 0
    const area = property.areaSqFt ?? 0
    const status = property.status ?? 'available'

    if (price < filters.priceMin || price > filters.priceMax) return false
    if (area < filters.areaMin || area > filters.areaMax) return false

    if (
      filters.propertyTypes.length &&
      !filters.propertyTypes.includes(property.propertyType ?? 'Plot')
    ) {
      return false
    }

    if (
      filters.possession.length &&
      !filters.possession.includes(property.possession ?? 'ready')
    ) {
      return false
    }

    if (!matchesFacing(property, filters.facing)) return false
    if (!matchesRoadWidth(property, filters.roadWidths)) return false
    if (!matchesAmenities(property, filters.amenities)) return false

    if (filters.statuses.length && !filters.statuses.includes(status)) {
      return false
    }

    if (filters.locations.length) {
      const loc = property.locationKey ?? property.location ?? ''
      const matched = filters.locations.some(
        (key) =>
          loc.toLowerCase().includes(key.toLowerCase()) ||
          (property.location ?? '').toLowerCase().includes(key.toLowerCase()),
      )
      if (!matched) return false
    }

    if (filters.cornerOnly && !property.corner) return false
    if (filters.parkFacingOnly && !property.parkFacing) return false
    if (filters.bankEligibleOnly && !property.bankEligible) return false
    if (filters.reraOnly && !property.reraRegistered) return false

    if (filters.highwayMaxKm != null) {
      if (highwayDistance(property) > filters.highwayMaxKm) return false
    }

    return true
  })
}

/** Unique location options derived from properties. */
export function getLocationOptions(properties) {
  const map = new Map()
  properties.forEach((property) => {
    const key = property.locationKey || property.location?.split(',')[0]?.trim()
    if (!key) return
    if (!map.has(key)) {
      map.set(key, { id: key, label: key })
    }
  })
  return [...map.values()]
}

/** Human-readable summary chips for a filter set. */
export function describeFilters(filters) {
  const chips = []
  const defaults = createDefaultFilters()

  if (filters.priceMin > defaults.priceMin || filters.priceMax < defaults.priceMax) {
    const fmt = (n) =>
      n >= 10000000
        ? `₹${(n / 10000000).toFixed(1)}Cr`
        : `₹${Math.round(n / 100000)}L`
    chips.push(`${fmt(filters.priceMin)}–${fmt(filters.priceMax)}`)
  }
  if (filters.areaMin > defaults.areaMin || filters.areaMax < defaults.areaMax) {
    chips.push(`${filters.areaMin}–${filters.areaMax} sq.ft`)
  }
  filters.propertyTypes.forEach((t) => chips.push(t))
  filters.facing.forEach((f) => chips.push(`${f} facing`))
  filters.roadWidths.forEach((id) => {
    const opt = ROAD_WIDTH_OPTIONS.find((o) => o.id === id)
    if (opt) chips.push(opt.label)
  })
  if (filters.cornerOnly) chips.push('Corner')
  if (filters.parkFacingOnly) chips.push('Park facing')
  if (filters.bankEligibleOnly) chips.push('Bank eligible')
  if (filters.reraOnly) chips.push('RERA')
  if (filters.highwayMaxKm != null) {
    chips.push(`≤ ${filters.highwayMaxKm} km highway`)
  }
  filters.locations.forEach((l) => chips.push(l))
  filters.amenities.forEach((id) => {
    const opt = AMENITY_FEATURE_OPTIONS.find((o) => o.id === id)
    if (opt) chips.push(opt.label)
  })
  return chips
}
