import { getVisitorId } from './visitor'
import { applyFilters } from './filters'

const SAVED_KEY = 'ila_saved_searches'
const NOTIFY_QUEUE_KEY = 'ila_saved_search_matches'

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
    /* ignore */
  }
}

function id() {
  return `ss-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getSavedSearches() {
  const visitorId = getVisitorId()
  return readJson(SAVED_KEY, []).filter((item) => item.visitorId === visitorId)
}

export function getAllSavedSearches() {
  return readJson(SAVED_KEY, [])
}

/**
 * Persist a filter combination for the current visitor.
 * @param {{ name?: string, filters: object, notify?: boolean, frequency?: string, mobile?: string }} payload
 */
export function saveSearch(payload) {
  const visitorId = getVisitorId()
  const all = readJson(SAVED_KEY, [])
  const entry = {
    id: id(),
    visitorId,
    name: payload.name?.trim() || 'My search',
    filters: payload.filters,
    notify: Boolean(payload.notify),
    frequency: payload.frequency || 'instant',
    channel: payload.channel || 'whatsapp',
    mobile: payload.mobile || '',
    createdAt: Date.now(),
    lastMatchedIds: [],
  }
  writeJson(SAVED_KEY, [entry, ...all])
  return entry
}

export function updateSavedSearch(searchId, patch) {
  const all = readJson(SAVED_KEY, [])
  const next = all.map((item) =>
    item.id === searchId ? { ...item, ...patch } : item,
  )
  writeJson(SAVED_KEY, next)
  return next.find((item) => item.id === searchId) ?? null
}

export function deleteSavedSearch(searchId) {
  const all = readJson(SAVED_KEY, [])
  writeJson(
    SAVED_KEY,
    all.filter((item) => item.id !== searchId),
  )
}

export function getInAppNotifications() {
  return readJson(NOTIFY_QUEUE_KEY, [])
}

export function clearInAppNotifications() {
  writeJson(NOTIFY_QUEUE_KEY, [])
}

/**
 * Demo background check: compare properties against saved searches
 * and enqueue in-app notifications for new matches.
 */
export function checkSavedSearchesAgainstProperties(properties) {
  const all = getAllSavedSearches().filter((item) => item.notify)
  if (!all.length) return []

  const notifications = getInAppNotifications()
  const fresh = []

  all.forEach((search) => {
    const matched = applyFilters(properties, search.filters)
    const matchedIds = matched.map((p) => p.id)
    const previous = new Set(search.lastMatchedIds ?? [])
    const newcomers = matched.filter((p) => !previous.has(p.id))

    if (newcomers.length) {
      newcomers.forEach((property) => {
        const note = {
          id: `n-${Date.now()}-${property.id}`,
          searchId: search.id,
          searchName: search.name,
          propertyId: property.id,
          propertyName: property.name,
          channel: search.channel,
          frequency: search.frequency,
          at: Date.now(),
        }
        fresh.push(note)
        notifications.unshift(note)
      })
    }

    updateSavedSearch(search.id, { lastMatchedIds: matchedIds })
  })

  writeJson(NOTIFY_QUEUE_KEY, notifications.slice(0, 30))
  return fresh
}
