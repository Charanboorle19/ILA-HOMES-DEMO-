import { useEffect, useMemo, useRef } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getPropertyById, properties } from '../data/properties'
import {
  BuyingJourneySteps,
  Connectivity,
  FutureNeighbourhoodMap,
  LegalDocuments,
  LifeStageMatch,
  Lifestyle,
  PriceEmiFuture,
  PropertyFinalCta,
  PropertyHero,
  SatelliteBeforeAfter,
  StickyBottomCta,
} from '../components/PropertyDetail'
import SimilarProperties from '../components/SimilarProperties/SimilarProperties'
import { getSimilarProperties } from '../lib/similar'
import { markPropertyViewed } from '../lib/visitor'
import { createDefaultFilters } from '../lib/filters'
import '../components/PropertyDetail/PropertyDetail.css'

function readPreferenceBias() {
  try {
    const raw = sessionStorage.getItem('ila_active_filters')
    if (!raw) return null
    return { ...createDefaultFilters(), ...JSON.parse(raw) }
  } catch {
    return null
  }
}

export default function PropertyPage() {
  const { propertyId } = useParams()
  const property = getPropertyById(propertyId)
  const heroRef = useRef(null)

  useEffect(() => {
    if (property?.id) markPropertyViewed(property.id)
  }, [property?.id])

  const similar = useMemo(() => {
    if (!property) return []
    return getSimilarProperties(property, properties, {
      limit: 6,
      preferenceBias: readPreferenceBias(),
    })
  }, [property])

  if (!property) {
    return <Navigate to="/properties" replace />
  }

  return (
    <div className="pd" key={property.id}>
      <PropertyHero property={property} heroRef={heroRef} />
      <LifeStageMatch property={property} />
      <FutureNeighbourhoodMap property={property} />
      <Lifestyle />
      <Connectivity property={property} />
      <PriceEmiFuture property={property} />
      <LegalDocuments property={property} />
      <SatelliteBeforeAfter property={property} />
      <BuyingJourneySteps />
      <SimilarProperties items={similar} />
      <PropertyFinalCta property={property} />
      <StickyBottomCta property={property} heroRef={heroRef} />
      <div className="pd-sticky-spacer" aria-hidden="true" />
    </div>
  )
}
