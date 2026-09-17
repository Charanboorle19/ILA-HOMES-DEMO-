import { useState } from 'react'
import Reveal from '../Reveal'
import PropertyMap from './PropertyMap'
import './PropertyMap.css'

/**
 * Landing-page section wrapping the interactive Mapbox experience.
 * Future ILA Guide can listen via onPropertySelect / onLocationSelect.
 */
export default function ExplorePropertiesMap({
  onPropertySelect,
  onLocationSelect,
}) {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handlePropertySelect = (property) => {
    setSelectedProperty(property)
    setSelectedLocation(null)
    onPropertySelect?.(property)
  }

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    setSelectedProperty(null)
    onLocationSelect?.(location)
  }

  return (
    <section className="section explore-map" id="explore-properties">
      <div className="section__intro explore-map__intro">
        <Reveal>
          <p className="explore-map__eyebrow">Interactive map</p>
          <h2 className="section__title">Explore Properties</h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="section__lede">
            Navigate Hyderabad&apos;s southern growth corridors and discover
            verified opportunities — designed for clarity, not clutter.
          </p>
        </Reveal>
      </div>

      <Reveal className="explore-map__frame" delay={120}>
        <PropertyMap
          selectedProperty={selectedProperty}
          selectedLocation={selectedLocation}
          onPropertySelect={handlePropertySelect}
          onLocationSelect={handleLocationSelect}
          onClearSelection={() => {
            setSelectedProperty(null)
            setSelectedLocation(null)
          }}
        />
      </Reveal>
    </section>
  )
}
