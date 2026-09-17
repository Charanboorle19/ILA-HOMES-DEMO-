/**
 * Demo property listings for the interactive map.
 * Coordinates are APPROXIMATE / DEMO ONLY — not exact real parcel locations.
 * Format: [longitude, latitude]
 */
export const mapProperties = [
  {
    id: 'property-01',
    title: 'Imperial City',
    location: 'Maheshwaram',
    area: '203 Sq Yards',
    facing: 'West Facing',
    approval: 'HMDA Final Approved',
    price: '₹40,000 / Sq Yd',
    priceShort: '₹40K',
    /** Approximate demo coordinates near Maheshwaram — not a surveyed parcel pin */
    coordinates: [78.432, 17.138],
    demoNote: 'Approximate demo location',
  },
  {
    id: 'property-02',
    title: 'Mansanpally Property',
    location: 'Mansanpally',
    area: '220 Sq Yards',
    facing: 'East Facing',
    approval: 'Verified Property',
    price: '₹21,000 / Sq Yd',
    priceShort: '₹21K',
    /** Approximate demo coordinates near Mansanpally — not a surveyed parcel pin */
    coordinates: [78.398, 17.152],
    demoNote: 'Approximate demo location',
  },
  {
    id: 'property-03',
    title: 'Thukkuguda Plots',
    location: 'Thukkuguda',
    area: 'Plot / Land',
    facing: 'North Facing',
    approval: 'Verified',
    price: 'Price on request',
    priceShort: 'POR',
    /** Approximate demo coordinates near Thukkuguda — not a surveyed parcel pin */
    coordinates: [78.458, 17.268],
    demoNote: 'Approximate demo location',
  },
]

const DEFAULT_DOCUMENTS = [
  { id: 'hmda', label: 'HMDA Approval', href: '#document-hmda' },
  { id: 'rera', label: 'RERA Registration', href: '#document-rera' },
  { id: 'title', label: 'Title Clearance', href: '#document-title' },
  { id: 'ec', label: 'Encumbrance Certificate', href: '#document-ec' },
  { id: 'layout', label: 'Layout Plan', href: '#document-layout' },
  { id: 'sale-deed', label: 'Sale Deed Format', href: '#document-sale-deed' },
]

const DEFAULT_CONNECTIVITY = [
  { id: 'metro', label: 'Upcoming Metro', distance: '2.4 km', icon: 'metro' },
  { id: 'school', label: 'International School', distance: '3.1 km', icon: 'school' },
  { id: 'it', label: 'IT Park', distance: '8.6 km', icon: 'it' },
  { id: 'hospital', label: 'Hospital', distance: '4.2 km', icon: 'hospital' },
  { id: 'orr', label: 'Outer Ring Road', distance: '1.8 km', icon: 'road' },
]

const DEFAULT_NEIGHBOURHOOD = {
  existing: [
    {
      id: 'orr',
      icon: 'road',
      label: 'Outer Ring Road',
      distance: '1.8 km',
      status: 'Operational',
      offset: [-0.028, 0.014],
    },
    {
      id: 'school',
      icon: 'school',
      label: 'International School',
      distance: '3.1 km',
      status: 'Operational',
      offset: [0.03, 0.018],
    },
    {
      id: 'hospital',
      icon: 'hospital',
      label: 'Hospital',
      distance: '4.2 km',
      status: 'Operational',
      offset: [0.012, -0.024],
    },
    {
      id: 'it',
      icon: 'building',
      label: 'IT Park',
      distance: '8.6 km',
      status: 'Under construction',
      offset: [0.034, -0.01],
    },
  ],
  proposed: [
    {
      id: 'metro',
      icon: 'metro',
      label: 'Proposed Metro Station',
      distance: '2.4 km',
      status: 'Planned 2029',
      offset: [-0.016, 0.02],
    },
    {
      id: 'it-p',
      icon: 'building',
      label: 'IT Park',
      distance: '8.6 km',
      status: 'Under construction',
      offset: [0.034, -0.01],
    },
    {
      id: 'school-p',
      icon: 'school',
      label: 'International School',
      distance: '3.1 km',
      status: 'Operational',
      offset: [0.03, 0.018],
    },
    {
      id: 'orr-p',
      icon: 'road',
      label: 'Outer Ring Road',
      distance: '1.8 km',
      status: 'Operational',
      offset: [-0.028, 0.014],
    },
  ],
}

const DEFAULT_TIMELINE = [
  { year: '2018', text: 'Quiet agricultural belt with limited access roads.' },
  { year: '2020', text: 'ORR connectivity improved daily commute options.' },
  { year: '2022', text: 'Schools and local retail began anchoring the area.' },
  { year: '2025', text: 'Active plotted demand with verified layouts on ground.' },
  { year: '2029', text: 'Metro and IT spillover expected to reshape values.' },
]

const DEFAULT_TESTIMONIAL = {
  quote:
    'We shortlisted this corridor for our family home — clear papers, honest timelines, and a neighbourhood that already feels livable.',
  name: 'Ananya Reddy',
  location: 'Gachibowli',
}

/**
 * Detail catalogue for /properties/:propertyId
 * Shared template fields — IDs align with the Properties listing.
 */
export const properties = [
  {
    id: 'singapore-township',
    name: 'Singapore Township',
    location: 'Isnapur, West Hyderabad',
    tagline: 'Gated living on the western growth edge.',
    description:
      'A compound-walled layout with practical plot sizes, clear approvals, and everyday connectivity toward the ORR and industrial corridors of west Hyderabad.',
    sqYards: '200 sq yd',
    facing: 'East',
    dimensions: '40 × 45 ft',
    roadWidth: '40 ft',
    price: 3200000,
    approval: 'HMDA',
    viewingCount: 6,
    enquiryCount: 2,
    lifeStageMatch: {
      family: { percent: 86, reason: 'Sized for a first home with room to grow and safe gated access.' },
      investment: { percent: 78, reason: 'West corridor demand is rising with industrial and ORR spillover.' },
      building: { percent: 91, reason: 'Ready-to-register plots with clear road and utility lines.' },
      retirement: { percent: 64, reason: 'Quieter than the city core, yet reachable for family visits.' },
    },
    connectivity: DEFAULT_CONNECTIVITY,
    documents: DEFAULT_DOCUMENTS,
    neighbourhood: DEFAULT_NEIGHBOURHOOD,
    timeline: DEFAULT_TIMELINE,
    testimonial: DEFAULT_TESTIMONIAL,
  },
  {
    id: 'nallagandla-enclave',
    name: 'Nallagandla Enclave',
    location: 'Near University of Hyderabad',
    tagline: 'Campus-adjacent plots with everyday calm.',
    description:
      'Walkable to the university belt, this enclave balances peaceful streets with access to north-west Hyderabad’s education and IT corridors.',
    sqYards: '267 sq yd',
    facing: 'North',
    dimensions: '45 × 53 ft',
    roadWidth: '40 ft',
    price: 4800000,
    approval: 'DTCP',
    viewingCount: 4,
    enquiryCount: 1,
    lifeStageMatch: {
      family: { percent: 92, reason: 'Near schools and campus life — ideal for raising children.' },
      investment: { percent: 81, reason: 'Education corridor demand stays resilient across cycles.' },
      building: { percent: 74, reason: 'Limited inventory — better for buyers ready to plan soon.' },
      retirement: { percent: 70, reason: 'Leafy setting with hospital and retail within easy reach.' },
    },
    connectivity: [
      { id: 'metro', label: 'Upcoming Metro', distance: '3.6 km', icon: 'metro' },
      { id: 'school', label: 'International School', distance: '1.9 km', icon: 'school' },
      { id: 'it', label: 'IT Park', distance: '6.2 km', icon: 'it' },
      { id: 'hospital', label: 'Hospital', distance: '2.8 km', icon: 'hospital' },
      { id: 'orr', label: 'Outer Ring Road', distance: '4.5 km', icon: 'road' },
    ],
    documents: DEFAULT_DOCUMENTS,
    neighbourhood: DEFAULT_NEIGHBOURHOOD,
    timeline: DEFAULT_TIMELINE,
    testimonial: {
      quote:
        'The location near the university made the decision easy. Papers were transparent and the visit felt unhurried.',
      name: 'Karthik Rao',
      location: 'Nallagandla',
    },
  },
  {
    id: 'kokapet-heights',
    name: 'Kokapet Heights',
    location: 'Kokapet – Financial District Belt',
    tagline: 'ORR-facing plots near Financial District.',
    description:
      'Premium plotted inventory with direct ORR service-road access and a short hop to Financial District — built for buyers who value connectivity and appreciation.',
    sqYards: '300 sq yd',
    facing: 'East',
    dimensions: '50 × 54 ft',
    roadWidth: '60 ft',
    price: 7800000,
    approval: 'HMDA',
    viewingCount: 9,
    enquiryCount: 4,
    lifeStageMatch: {
      family: { percent: 72, reason: 'Strong for dual-income households working in FD / Gachibowli.' },
      investment: { percent: 94, reason: 'One of the tightest supply corridors with ORR frontage.' },
      building: { percent: 88, reason: 'Infrastructure-ready plots suited to near-term construction.' },
      retirement: { percent: 48, reason: 'Busier premium belt — better as a long-term hold than quiet living.' },
    },
    connectivity: [
      { id: 'metro', label: 'Upcoming Metro', distance: '1.6 km', icon: 'metro' },
      { id: 'school', label: 'International School', distance: '2.7 km', icon: 'school' },
      { id: 'it', label: 'IT Park', distance: '3.4 km', icon: 'it' },
      { id: 'hospital', label: 'Hospital', distance: '3.9 km', icon: 'hospital' },
      { id: 'orr', label: 'Outer Ring Road', distance: '0.6 km', icon: 'road' },
    ],
    documents: DEFAULT_DOCUMENTS,
    neighbourhood: DEFAULT_NEIGHBOURHOOD,
    timeline: DEFAULT_TIMELINE,
    testimonial: {
      quote:
        'Kokapet was always on our list. ILA walked us through EMI versus appreciation without pressure.',
      name: 'Sneha & Vikram',
      location: 'Financial District',
    },
  },
  {
    id: 'khajaguda-residency',
    name: 'Khajaguda Residency',
    location: 'Khajaguda, Rajendra Nagar',
    tagline: 'Park-facing premium corner plots.',
    description:
      'A tighter, premium layout with park-facing corners and strong road hierarchy — suited to buyers who want neighbourhood character close to the city.',
    sqYards: '400 sq yd',
    facing: 'North',
    dimensions: '60 × 60 ft',
    roadWidth: '60 ft',
    price: 11200000,
    approval: 'GHMC',
    viewingCount: 3,
    enquiryCount: 2,
    lifeStageMatch: {
      family: { percent: 84, reason: 'Larger plots give space for a lasting family home.' },
      investment: { percent: 76, reason: 'Scarcity in this pocket supports long-horizon value.' },
      building: { percent: 80, reason: 'Almost sold out — move quickly if building is the plan.' },
      retirement: { percent: 82, reason: 'Established surroundings with hospitals and parks nearby.' },
    },
    connectivity: DEFAULT_CONNECTIVITY,
    documents: DEFAULT_DOCUMENTS,
    neighbourhood: DEFAULT_NEIGHBOURHOOD,
    timeline: DEFAULT_TIMELINE,
    testimonial: DEFAULT_TESTIMONIAL,
  },
  {
    id: 'patancheru-gateway',
    name: 'Patancheru Gateway',
    location: 'Patancheru, NH-65 Corridor',
    tagline: 'Entry pricing on a high-growth pharma corridor.',
    description:
      'Accessible plot sizes for first-time buyers and investors tracking Pharma City and NH-65 corridor momentum.',
    sqYards: '167 sq yd',
    facing: 'East',
    dimensions: '33 × 45 ft',
    roadWidth: '30 ft',
    price: 1850000,
    approval: 'DTCP',
    viewingCount: 5,
    enquiryCount: 3,
    lifeStageMatch: {
      family: { percent: 68, reason: 'Affordable ticket size for a starter home on a growth belt.' },
      investment: { percent: 90, reason: 'Pharma corridor appreciation thesis is the primary draw.' },
      building: { percent: 77, reason: 'Open for booking with straightforward plot footprints.' },
      retirement: { percent: 42, reason: 'Better as an investment hold than a quiet retirement base.' },
    },
    connectivity: DEFAULT_CONNECTIVITY,
    documents: DEFAULT_DOCUMENTS,
    neighbourhood: DEFAULT_NEIGHBOURHOOD,
    timeline: DEFAULT_TIMELINE,
    testimonial: DEFAULT_TESTIMONIAL,
  },
  {
    id: 'mansanpally-meadows',
    name: 'Mansanpally Meadows',
    location: 'Mansanpally, Shamshabad Belt',
    tagline: 'Airport-side living with room to breathe.',
    description:
      'HMDA-approved meadows near Shamshabad — a practical balance of open surroundings, airport access, and south Hyderabad’s next wave of infrastructure.',
    sqYards: '240 sq yd',
    facing: 'North',
    dimensions: '40 × 54 ft',
    roadWidth: '40 ft',
    price: 2900000,
    approval: 'HMDA',
    viewingCount: 7,
    enquiryCount: 2,
    lifeStageMatch: {
      family: { percent: 88, reason: 'Open layout and gated feel suit growing families.' },
      investment: { percent: 85, reason: 'Airport belt continues to attract end-user and investor demand.' },
      building: { percent: 90, reason: 'Ready to register with utilities planned into the layout.' },
      retirement: { percent: 75, reason: 'Quieter than the city, yet 15 minutes from RGIA.' },
    },
    connectivity: [
      { id: 'metro', label: 'Upcoming Metro', distance: '5.2 km', icon: 'metro' },
      { id: 'school', label: 'International School', distance: '4.0 km', icon: 'school' },
      { id: 'it', label: 'IT Park', distance: '12 km', icon: 'it' },
      { id: 'hospital', label: 'Hospital', distance: '5.5 km', icon: 'hospital' },
      { id: 'orr', label: 'Outer Ring Road', distance: '3.2 km', icon: 'road' },
    ],
    documents: DEFAULT_DOCUMENTS,
    neighbourhood: DEFAULT_NEIGHBOURHOOD,
    timeline: DEFAULT_TIMELINE,
    testimonial: {
      quote:
        'We wanted something near the airport without city noise. The documentation checklist gave us confidence.',
      name: 'Rahul Mehta',
      location: 'Shamshabad',
    },
  },
]

import { propertyLayouts } from './propertyLayouts'

export function getPropertyById(propertyId) {
  const property = properties.find((item) => item.id === propertyId)
  if (!property) return null

  const layout = propertyLayouts.find((item) => item.id === propertyId)
  return {
    ...property,
    coordinates: layout ? [layout.lng, layout.lat] : [78.44, 17.25],
    zoom: 12.6,
  }
}

export default mapProperties
