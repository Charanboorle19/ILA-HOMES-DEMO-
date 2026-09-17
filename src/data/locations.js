/**
 * Growth-corridor focus points for the interactive map.
 * Coordinates are APPROXIMATE / DEMO ONLY for prototype framing.
 * Format: [longitude, latitude]
 */
export const mapLocations = [
  {
    id: 'south-hyderabad',
    name: 'South Hyderabad',
    description:
      'A major growth corridor shaped by connectivity, infrastructure and emerging development.',
    /** Approximate regional focus — not a single address */
    coordinates: [78.44, 17.25],
    zoom: 11.2,
    demoNote: 'Approximate corridor focus',
  },
  {
    id: 'maheshwaram',
    name: 'Maheshwaram',
    description:
      'A developing southern belt with improving access and interest in plotted opportunities.',
    coordinates: [78.43, 17.14],
    zoom: 12.2,
    demoNote: 'Approximate area focus',
  },
  {
    id: 'thukkuguda',
    name: 'Thukkuguda',
    description:
      'Infrastructure-led growth near key transit and employment routes south of the city.',
    coordinates: [78.46, 17.27],
    zoom: 12.4,
    demoNote: 'Approximate area focus',
  },
  {
    id: 'mansanpally',
    name: 'Mansanpally',
    description:
      'An emerging pocket within the wider Maheshwaram growth belt.',
    coordinates: [78.4, 17.155],
    zoom: 12.5,
    demoNote: 'Approximate area focus',
  },
  {
    id: 'future-city',
    name: 'Future City',
    description:
      'A long-horizon planning zone tied to the next phase of Hyderabad’s southern expansion.',
    coordinates: [78.38, 17.19],
    zoom: 11.8,
    demoNote: 'Approximate area focus',
  },
]

/** Default Hyderabad overview camera */
export const HYDERABAD_VIEW = {
  longitude: 78.45,
  latitude: 17.28,
  zoom: 10.4,
  pitch: 0,
  bearing: 0,
}

/** Quick focus: South Hyderabad corridor */
export const SOUTH_HYDERABAD_VIEW = {
  longitude: 78.44,
  latitude: 17.24,
  zoom: 11.35,
  pitch: 0,
  bearing: 0,
}

/**
 * Subtle reference labels (non-interactive) to orient the map.
 * Approximate public landmarks / corridor names only.
 */
export const mapReferencePoints = [
  { id: 'hyd', label: 'Hyderabad', coordinates: [78.4867, 17.385] },
  { id: 'rgia', label: 'RGIA', coordinates: [78.4294, 17.2403] },
  { id: 'orr-s', label: 'ORR', coordinates: [78.49, 17.3] },
]

export default mapLocations
