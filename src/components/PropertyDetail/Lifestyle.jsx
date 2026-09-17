import { useEffect, useState } from 'react'
import InfraIcon from './InfraIcon'
import lifestyle1 from '../../assets/extra-image-6.png'
import lifestyle2 from '../../assets/extra-image-7.png'
import lifestyle3 from '../../assets/extra-image-8.png'
import lifestyle4 from '../../assets/extra-image-9.png'
import './Lifestyle.css'

const ITEMS = [
  {
    id: 'family',
    caption: 'Space for your family',
    icon: 'family',
    src: lifestyle1,
  },
  {
    id: 'green',
    caption: 'Green surroundings',
    icon: 'green',
    src: lifestyle2,
  },
  {
    id: 'amenities',
    caption: 'Modern amenities',
    icon: 'amenities',
    src: lifestyle3,
  },
  {
    id: 'opportunity',
    caption: 'Better opportunities',
    icon: 'opportunity',
    src: lifestyle4,
  },
]

const ROTATE_MS = 4000

export default function Lifestyle() {
  const [active, setActive] = useState(0)
  const [tick, setTick] = useState(0)
  const current = ITEMS[active]

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % ITEMS.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [tick])

  function selectItem(index) {
    setActive(index)
    setTick((value) => value + 1)
  }

  return (
    <section className="pd-section pd-lifestyle" aria-labelledby="pd-lifestyle-title">
      <div className="pd__frame pd-lifestyle__layout">
        <div className="pd-lifestyle__copy">
          <header className="pd-lifestyle__intro">
            <p className="pd-eyebrow">Lifestyle</p>
            <h2 id="pd-lifestyle-title" className="pd-heading">
              More than land.
              <br />
              A better way of life.
            </h2>
            <p className="pd-lede">
              Plot ownership here is about daily rhythm — room to grow, greener
              edges, and access to the amenities that make South Hyderabad livable.
            </p>
          </header>

          <ul className="pd-lifestyle__list" role="list">
            {ITEMS.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`pd-lifestyle__item${index === active ? ' is-active' : ''}`}
                  aria-pressed={index === active}
                  onClick={() => selectItem(index)}
                >
                  <span className="pd-lifestyle__icon" aria-hidden="true">
                    <InfraIcon name={item.icon} className="pd-lifestyle__svg" />
                  </span>
                  <span>{item.caption}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pd-lifestyle__stage" aria-live="polite">
          {ITEMS.map((item, index) => (
            <img
              key={item.id}
              src={item.src}
              alt={item.caption}
              className={`pd-lifestyle__img${index === active ? ' is-active' : ''}`}
            />
          ))}
          <div className="pd-lifestyle__caption">
            <span className="pd-lifestyle__caption-icon" aria-hidden="true">
              <InfraIcon name={current.icon} className="pd-lifestyle__svg" />
            </span>
            {current.caption}
          </div>
          <div className="pd-lifestyle__dots" aria-hidden="true">
            {ITEMS.map((item, index) => (
              <span
                key={item.id}
                className={`pd-lifestyle__dot${index === active ? ' is-active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
