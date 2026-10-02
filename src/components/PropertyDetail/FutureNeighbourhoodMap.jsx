import { useMemo, useState } from 'react'
import MasterPlanMap from '../MasterPlanMap'
import InfraIcon from './InfraIcon'
import './FutureNeighbourhoodMap.css'

const DEMO_USER = {
  label: 'Gachibowli (demo)',
  coordinates: [78.3489, 17.4401],
}

function formatKm(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

function haversineKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function FutureNeighbourhoodMap({ property }) {
  const [mode, setMode] = useState('today')
  const [nearbyMe, setNearbyMe] = useState(false)

  const infrastructure =
    mode === 'today'
      ? property.neighbourhood.existing
      : property.neighbourhood.proposed

  const distanceFromYou = useMemo(
    () => haversineKm(DEMO_USER.coordinates, property.coordinates),
    [property.coordinates],
  )

  const infraWithDistance = useMemo(
    () =>
      infrastructure.map((item) => ({
        ...item,
        displayDistance: nearbyMe
          ? `${formatKm(distanceFromYou)} from plot belt`
          : item.distance,
      })),
    [infrastructure, nearbyMe, distanceFromYou],
  )

  const mapConnectivity = useMemo(
    () =>
      infrastructure.map((item) => ({
        id: item.id,
        label: item.label,
        distance: item.distance,
        status: item.status,
        icon: item.icon,
        offset: item.offset ?? [0, 0],
      })),
    [infrastructure],
  )

  return (
    <section className="pd-future" aria-labelledby="pd-future-title">
      <div className="pd-future__shell">
        <aside className="pd-future__side">
          <p className="pd-eyebrow">Future neighbourhood</p>
          <h2 id="pd-future-title" className="pd-heading">
            Not just today.
            <br />
            A brighter 2029.
          </h2>
          <p className="pd-lede">
            Toggle between what already surrounds this plot and the
            infrastructure expected to reshape the belt over the next few years.
          </p>

          <div className="pd-future__controls">
            <div className="pd-future__toggle" role="group" aria-label="Map timeframe">
              <button
                type="button"
                className={mode === 'today' ? 'is-active' : ''}
                onClick={() => setMode('today')}
              >
                Today
              </button>
              <button
                type="button"
                className={mode === '2029' ? 'is-active' : ''}
                onClick={() => setMode('2029')}
              >
                In 2029
              </button>
            </div>

            <button
              type="button"
              className={`pd-future__nearby${nearbyMe ? ' is-active' : ''}`}
              aria-pressed={nearbyMe}
              onClick={() => setNearbyMe((prev) => !prev)}
            >
              Near by me
            </button>
          </div>

          {nearbyMe && (
            <div className="pd-future__nearby-card" aria-live="polite">
              <p className="pd-future__nearby-kicker">From your location</p>
              <p className="pd-future__nearby-distance">
                {formatKm(distanceFromYou)} to this plot
              </p>
              <p className="pd-future__nearby-note">
                Demo location: {DEMO_USER.label}
              </p>
            </div>
          )}

          <ul className="pd-future__infra-list">
            {infraWithDistance.map((item) => (
              <li key={`${mode}-${item.id}`}>
                <span className="pd-future__infra-icon" aria-hidden="true">
                  <InfraIcon name={item.icon} className="pd-future__svg-icon" />
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <span className="pd-future__infra-meta">
                    {item.displayDistance} · {item.status}
                  </span>
                  {item.detail ? (
                    <span className="pd-future__infra-detail">{item.detail}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          <ul className="pd-future__legend">
            <li>
              <span className="pd-future__dot is-existing" /> Existing
            </li>
            <li>
              <span className="pd-future__dot is-construction" /> Under construction
            </li>
            <li>
              <span className="pd-future__dot is-proposed" /> Proposed
            </li>
          </ul>
        </aside>

        <div className="pd-future__map-pane">
          <div className="pd-future__map-wrap pd-future__map-wrap--master-plan">
            <MasterPlanMap
              className="pd-future__master-plan"
              title={`${property.name} — Master Plan`}
              channel="neighbourhood"
              theme="light"
              origin={property.coordinates}
              connectivity={mapConnectivity}
            />
          </div>

          <div className="pd-future__pill">
            <div>
              <div className="pd-future__pill-name">{property.name}</div>
              <div className="pd-future__pill-tag">
                {nearbyMe
                  ? `${formatKm(distanceFromYou)} from ${DEMO_USER.label}`
                  : mode === 'today'
                    ? 'Neighbourhood today'
                    : 'Projected 2029 context'}
              </div>
            </div>
            <div className="pd-future__pill-badge">{property.location.split(',')[0]}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
