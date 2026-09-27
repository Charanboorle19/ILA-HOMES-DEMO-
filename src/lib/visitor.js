const VISITOR_KEY = 'ila_visitor_id'
const INTEREST_KEY = 'ila_interest'
const VIEWED_KEY = 'ila_viewed_properties'
const WISHLIST_KEY = 'ila_wishlist'
const MOBILE_KEY = 'ila_visitor_mobile'

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Stable anonymous visitor id (cookie-like via localStorage). */
export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = uuid()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return 'anonymous'
  }
}

export function getVisitorMobile() {
  try {
    return localStorage.getItem(MOBILE_KEY) || ''
  } catch {
    return ''
  }
}

export function setVisitorMobile(digits) {
  try {
    localStorage.setItem(MOBILE_KEY, digits)
  } catch {
    /* ignore */
  }
}

export function getInterestScore() {
  const data = readJson(INTEREST_KEY, { score: 0, events: [] })
  return data.score ?? 0
}

/**
 * Add interest points for an action.
 * @param {string} action
 * @param {number} points
 * @param {object} [meta]
 */
export function addInterest(action, points, meta = {}) {
  const data = readJson(INTEREST_KEY, { score: 0, events: [] })
  data.score = (data.score ?? 0) + points
  data.events = [
    { action, points, at: Date.now(), ...meta },
    ...(data.events ?? []).slice(0, 49),
  ]
  writeJson(INTEREST_KEY, data)
  return data.score
}

export function getViewedPropertyIds() {
  return readJson(VIEWED_KEY, [])
}

export function markPropertyViewed(propertyId) {
  const ids = getViewedPropertyIds()
  if (ids.includes(propertyId)) return ids
  const next = [propertyId, ...ids].slice(0, 40)
  writeJson(VIEWED_KEY, next)
  addInterest('property_view', 2, { propertyId })
  return next
}

export function getWishlistIds() {
  return readJson(WISHLIST_KEY, [])
}

export function toggleWishlist(propertyId) {
  const ids = getWishlistIds()
  const next = ids.includes(propertyId)
    ? ids.filter((id) => id !== propertyId)
    : [...ids, propertyId]
  writeJson(WISHLIST_KEY, next)
  if (!ids.includes(propertyId)) {
    addInterest('wishlist_add', 3, { propertyId })
  }
  return next
}
