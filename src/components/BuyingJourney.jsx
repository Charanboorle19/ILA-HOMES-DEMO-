import { useEffect, useRef, useState } from 'react'
import step1 from '../assets/step-1.png'
import step2 from '../assets/step-2.png'
import step3 from '../assets/step-3.png'
import step4 from '../assets/step-4.png'
import step5 from '../assets/step-5.png'
import stepLan1 from '../assets/step-lan-1.png'
import stepLan2 from '../assets/step-lan-2.png'
import stepLan3 from '../assets/step-lan-3.png'
import stepLan4 from '../assets/step-lan-4.png'
import stepLan5 from '../assets/step-lan-5.png'
import './BuyingJourney.css'

const STEPS = [
  {
    id: 'select',
    number: '01',
    name: 'Select Your Plot & Review Feasibility',
    time: '1 to 3 Days',
    image: step1,
    imageMobile: stepLan1,
    summary:
      'Browse live layouts, zoning, and a fully itemized price sheet before you commit.',
    happens: [
      'Browse live master layouts showing exact square footage, frontage width, orientation (Vastu/cardinal direction), and proximity to access roads.',
      'Review baseline zoning classifications (residential, commercial, or agricultural conversion status).',
      'Receive a clear price sheet with all mandatory charges itemized upfront (base land cost, infrastructure/development fees, corner/park-facing premiums).',
    ],
    receives: [
      'Plot reservation worksheet',
      'Master plan overlay showing the selected unit',
    ],
  },
  {
    id: 'inspect',
    number: '02',
    name: 'Guided On-Site Inspection & Boundary Demarcation',
    time: 'Day 3 to Day 7',
    image: step2,
    imageMobile: stepLan2,
    summary:
      'Walk the ground, verify boundaries, and confirm access, drainage, and utilities.',
    happens: [
      'Walk the physical ground with a project representative to verify road access, soil grading, drainage, and utility hookup points (water, electricity).',
      'Verify physical boundary markers and corner survey stones against the layout diagram.',
      'Assess neighborhood connectivity, approach corridors, and active civic infrastructure.',
    ],
    receives: [
      'Site visit dossier',
      'Physical plot coordinate sheet',
      'Initial plot reservation token receipt upon selection',
    ],
  },
  {
    id: 'legal',
    number: '03',
    name: 'Legal Due Diligence & Document Verification',
    time: '5 to 10 Business Days',
    image: step3,
    imageMobile: stepLan3,
    summary:
      'Full title chain, statutory approvals, and independent advocate access — no opaque files.',
    happens: [
      'Access the complete title chain (parent deeds dating back 30+ years) showing unencumbered ownership.',
      'Inspect statutory layout sanctions, municipal/development authority approvals, and RERA registration documents.',
      'Independent legal verification: your own advocate receives full, unhindered access to copies of original deeds and certificates to verify title clearance.',
    ],
    receives: [
      'Encumbrance Certificate (EC) verifying zero liens, court attachments, or disputes',
      'Government land use / conversion certificate',
      'Sanctioned layout approval order and certified survey sketch',
    ],
  },
  {
    id: 'agreement',
    number: '04',
    name: 'Transparent Agreement & Structured Payment',
    time: '7 to 14 Business Days',
    image: step4,
    imageMobile: stepLan4,
    summary:
      'Formal sale agreement with clear payment paths — including bank coordination if needed.',
    happens: [
      'Execute a formal Agreement of Sale (Bilateral Contract) detailing plot boundaries, agreed-upon purchase consideration, and registration date commitments.',
      'Choose between full down-payment or bank-financed payment schedules.',
      'If financing, our team coordinates directly with approved panel banks for hassle-free home/plot loan disbursements.',
    ],
    receives: [
      'Stamped Sale Agreement copy',
      'Bank pre-clearance validation',
      'Official transaction receipts for all staged disbursements',
    ],
  },
  {
    id: 'register',
    number: '05',
    name: 'Sub-Registrar Office Execution & Khata/Title Mutation',
    time: '1 Day (Execution) + 15 to 30 Days (Mutation)',
    image: step5,
    imageMobile: stepLan5,
    summary:
      'Official registration, possession handover, and mutation of revenue records in your name.',
    happens: [
      'Schedule an appointment at the local Sub-Registrar’s office for Sale Deed execution.',
      'Pay statutory stamp duty and registration fees via direct government challan—no gray-market cash handling.',
      'Biometric verification, digital photo capture, and official signing by both parties in front of the registrar.',
      'Physical handover of plot possession keys/pegs and original title bundle.',
      'Follow-up mutation filing with local revenue records to reflect your name in municipal tax books.',
    ],
    receives: [
      'Registered Sale Deed original',
      'Possession Certificate and physical handover letter',
      'Updated Revenue Record / Municipal Tax Account (Khata/Patta) transfer proof',
    ],
  },
]

const MOBILE_QUERY = '(max-width: 980px)'

function useIsMobileBuyingJourney() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY)
    const sync = () => setIsMobile(mediaQuery.matches)
    sync()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', sync)
      return () => mediaQuery.removeEventListener('change', sync)
    }
    mediaQuery.addListener(sync)
    return () => mediaQuery.removeListener(sync)
  }, [])

  return isMobile
}

export default function BuyingJourney() {
  const isMobile = useIsMobileBuyingJourney()
  const [activeStep, setActiveStep] = useState(STEPS[0].id)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const copyRef = useRef(null)
  const stepsRef = useRef(null)
  const stepItemRefs = useRef({})
  const current = STEPS.find((step) => step.id === activeStep) ?? STEPS[0]
  const stepImage = isMobile ? current.imageMobile : current.image

  useEffect(() => {
    setDetailsOpen(false)
  }, [activeStep])

  useEffect(() => {
    if (copyRef.current) copyRef.current.scrollTop = 0
  }, [activeStep, detailsOpen])

  function selectStep(id) {
    setActiveStep(id)
    setDetailsOpen(false)
  }

  useEffect(() => {
    const list = stepsRef.current
    const item = stepItemRefs.current[activeStep]
    if (!list || !item) return

    const target =
      item.offsetLeft - (list.clientWidth - item.clientWidth) / 2
    list.scrollTo({
      left: Math.max(0, target),
      behavior: 'smooth',
    })
  }, [activeStep])

  useEffect(() => {
    // Pause auto-advance while mobile details are open
    if (isMobile && detailsOpen) return undefined

    const timer = window.setTimeout(() => {
      setActiveStep((prev) => {
        const index = STEPS.findIndex((step) => step.id === prev)
        return STEPS[(index + 1) % STEPS.length].id
      })
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [activeStep, isMobile, detailsOpen])

  return (
    <section
      className="buying-journey"
      id="buying-journey"
      aria-label="Your buying journey"
    >
      <div className="buying-journey__frame">
        <div className="buying-journey__left">
          <header className="buying-journey__intro">
            <p className="buying-journey__eyebrow">Your buying journey</p>
            <h2 className="buying-journey__heading">
              Your step-by-step guide to buying a plot
            </h2>
            <p className="buying-journey__lede">
              No hidden charges, no legal surprises — just a clear process from site visit
              to registration.
            </p>
          </header>

          <ol
            ref={stepsRef}
            className="buying-journey__steps"
            aria-label="Buying steps"
          >
            {STEPS.map((step) => {
              const isActive = step.id === activeStep
              return (
                <li
                  key={step.id}
                  ref={(node) => {
                    if (node) stepItemRefs.current[step.id] = node
                    else delete stepItemRefs.current[step.id]
                  }}
                >
                  <button
                    type="button"
                    className={`buying-journey__step${isActive ? ' is-active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => selectStep(step.id)}
                  >
                    <span className="buying-journey__step-index" aria-hidden="true">
                      {step.number}
                    </span>
                    <span className="buying-journey__step-name">{step.name}</span>
                    <span className="buying-journey__step-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        <aside className="buying-journey__detail" aria-live="polite">
          <div key={current.id} className="buying-journey__detail-inner">
            <div className="buying-journey__media">
              <div className="buying-journey__media-frame">
                <img
                  className="buying-journey__media-image"
                  src={stepImage}
                  alt={`Illustration for step ${current.number}: ${current.name}`}
                />
              </div>
            </div>

            <div className="buying-journey__copy" ref={copyRef}>
              <header className="buying-journey__detail-head">
                <p className="buying-journey__detail-kicker">Step {current.number}</p>
                <h3 className="buying-journey__detail-title">{current.name}</h3>
                <p className="buying-journey__detail-time">
                  Typical timeline · {current.time}
                </p>
                <p className="buying-journey__detail-summary">{current.summary}</p>
              </header>

              {isMobile ? (
                <button
                  type="button"
                  className={`buying-journey__about-toggle${detailsOpen ? ' is-open' : ''}`}
                  aria-expanded={detailsOpen}
                  onClick={() => setDetailsOpen((open) => !open)}
                >
                  {detailsOpen ? 'Hide details' : 'View about this'}
                </button>
              ) : null}

              {(!isMobile || detailsOpen) && (
                <div className="buying-journey__panels">
                  <div className="buying-journey__panel">
                    <h4 className="buying-journey__panel-title">What happens</h4>
                    <ul className="buying-journey__list">
                      {current.happens.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="buying-journey__panel buying-journey__panel--receive">
                    <h4 className="buying-journey__panel-title">What you receive</h4>
                    <ul className="buying-journey__list buying-journey__list--receive">
                      {current.receives.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
