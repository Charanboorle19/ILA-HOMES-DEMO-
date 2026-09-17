import Reveal from './Reveal'
import { locations } from '../data/site'

export default function Locations() {
  return (
    <section className="section locations" id="locations">
      <div className="section__intro">
        <Reveal>
          <h2 className="section__title">
            Explore Hyderabad&apos;s growth corridors
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="section__lede">
            Discover locations where infrastructure, connectivity and development
            are shaping the next phase of Hyderabad.
          </p>
        </Reveal>
      </div>

      <div className="locations__grid">
        {locations.map((location, index) => (
          <Reveal key={location.id} delay={index * 70} className="location-card">
            <a className="location-card__link" href={`#${location.id}`}>
              <div className="media-frame">
                <img
                  src={location.image}
                  alt=""
                  width={800}
                  height={600}
                  loading="lazy"
                />
              </div>
              <div className="location-card__body">
                <h3>{location.name}</h3>
                <p>{location.description}</p>
                <span className="text-link">Explore →</span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
