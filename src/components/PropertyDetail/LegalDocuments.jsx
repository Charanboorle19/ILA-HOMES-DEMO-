import './LegalDocuments.css'

function CheckIcon() {
  return (
    <svg
      className="pd-legal__icon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.2 10.2l2.4 2.4 5.2-5.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function LegalDocuments({ property }) {
  return (
    <section className="pd-section pd-section--alt pd-legal" aria-labelledby="pd-legal-title">
      <div className="pd__frame pd-legal__grid">
        <div>
          <p className="pd-eyebrow">Legal clarity</p>
          <h2 id="pd-legal-title" className="pd-heading">
            Documents you can verify
          </h2>

          <ul className="pd-legal__list">
            {property.documents.map((doc) => (
              <li key={doc.id}>
                <CheckIcon />
                <span className="pd-legal__label">{doc.label}</span>
                <a className="pd-legal__link" href={doc.href}>
                  View
                  <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="pd-legal__build">
            <p>Can I build a house here?</p>
            <a href="#document-build-rules">View Details</a>
          </div>
        </div>

        <aside className="pd-legal__callout">
          <p className="pd-legal__callout-kicker">ILA Homes standard</p>
          <h3>Verified before it is listed</h3>
          <p>
            Every layout on this page passes title review, approval checks, and
            document completeness before we publish it. If a paper is pending, we
            say so — we do not hide uncertainty behind urgency.
          </p>
        </aside>
      </div>
    </section>
  )
}
