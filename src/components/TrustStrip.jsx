import Reveal from './Reveal'
import { trustItems } from '../data/site'

export default function TrustStrip() {
  return (
    <section className="trust" aria-label="Trust signals">
      <Reveal className="trust__inner">
        <ul className="trust__list">
          {trustItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
