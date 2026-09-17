import { useRef } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getPropertyById } from '../data/properties'
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
import '../components/PropertyDetail/PropertyDetail.css'

export default function PropertyPage() {
  const { propertyId } = useParams()
  const property = getPropertyById(propertyId)
  const heroRef = useRef(null)

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
      <PropertyFinalCta property={property} />
      <StickyBottomCta property={property} heroRef={heroRef} />
      <div className="pd-sticky-spacer" aria-hidden="true" />
    </div>
  )
}
