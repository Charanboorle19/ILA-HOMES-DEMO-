import './BuyingJourneySteps.css'

const STEPS = [
  {
    number: '01',
    title: 'Enquire',
    description: 'Share your goal and preferred plot size — we respond with clear options.',
  },
  {
    number: '02',
    title: 'Site Visit',
    description: 'Walk the layout with a guide who knows the papers and the neighbourhood.',
  },
  {
    number: '03',
    title: 'Legal Verification',
    description: 'Review approvals, title, and encumbrance with documented clarity.',
  },
  {
    number: '04',
    title: 'Book and Pay',
    description: 'Reserve with a transparent payment schedule — no surprise clauses.',
  },
  {
    number: '05',
    title: 'Registration',
    description: 'We coordinate registration so the handover stays on track.',
  },
]

export default function BuyingJourneySteps() {
  return (
    <section className="pd-section pd-section--alt pd-journey" aria-labelledby="pd-journey-title">
      <div className="pd__frame">
        <p className="pd-eyebrow">Buying journey</p>
        <h2 id="pd-journey-title" className="pd-heading">
          A simple, transparent process.
        </h2>

        <ol className="pd-journey__steps">
          {STEPS.map((step, index) => (
            <li key={step.number} className="pd-journey__step">
              {index < STEPS.length - 1 && (
                <span className="pd-journey__line" aria-hidden="true" />
              )}
              <span className="pd-journey__num">{step.number}</span>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
