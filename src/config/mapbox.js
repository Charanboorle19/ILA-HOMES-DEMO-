/**
 * Shared Mapbox env access for Vite.
 * Set MAPBOX_ACCESS_TOKEN in `.env.local` (see `.env.example`).
 * Exposed via `envPrefix` in vite.config.js.
 */
export const MAPBOX_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN

export const HAS_MAPBOX_TOKEN =
  Boolean(MAPBOX_TOKEN) &&
  String(MAPBOX_TOKEN).trim() !== '' &&
  MAPBOX_TOKEN !== 'YOUR_MAPBOX_PUBLIC_TOKEN'
