import { Link } from 'react-router-dom'
import Reveal from './Reveal'

export default function FinalCta() {
  return (
    <section className="section final-cta" id="contact">
      <Reveal className="final-cta__inner">
        <h2 className="section__title">
          Let&apos;s find the right property for you.
        </h2>
        <div className="final-cta__actions">
          <Link className="btn btn--solid" to="/properties">
            Browse Properties
          </Link>
          <a className="btn btn--ghost" href="mailto:hello@ilahomes.example">
            Talk to ILA
          </a>
        </div>
      </Reveal>
    </section>
  )
}
