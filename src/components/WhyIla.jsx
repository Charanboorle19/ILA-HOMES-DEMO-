import Reveal from './Reveal'
import { whyPoints } from '../data/site'

export default function WhyIla() {
  return (
    <section className="section why" id="why-ila">
      <div className="why__layout">
        <Reveal className="why__intro">
          <h2 className="section__title">
            Property decisions,
            <br />
            without the uncertainty.
          </h2>
        </Reveal>

        <ol className="why__list">
          {whyPoints.map((point, index) => (
            <Reveal key={point.number} delay={index * 70} as="li" className="why__item">
              <span className="why__number">{point.number}</span>
              <div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
