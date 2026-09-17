import { useState } from 'react'
import './LifeStageMatch.css'

function IconFamily() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 18.5c.7-2.8 2.6-4.2 4.5-4.2s3.8 1.4 4.5 4.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.8 18.5c.4-1.8 1.5-2.8 2.8-2.8 1.2 0 2.1.8 2.5 2.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconTrend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 17.5 10 11.5l3.5 3.5L20 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 8h5v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 11.5 12 5l8 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10.5V19h10v-8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19c8 0 12-5.5 12-13-5 0-12 4-12 13Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 19c3-4 6.5-7 12-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h12.5M13 6.5 18.5 12 13 17.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const GOALS = [
  {
    key: 'family',
    span: 'family',
    name: 'Starting a family',
    description:
      'Looking for a safe, growing neighbourhood with schools and parks nearby.',
    Icon: IconFamily,
  },
  {
    key: 'investment',
    span: 'investment',
    name: 'Investment first',
    description:
      'Buying for appreciation. High-growth corridors near upcoming infrastructure.',
    Icon: IconTrend,
  },
  {
    key: 'building',
    span: 'build',
    name: 'Building my home',
    description:
      'Ready to build. Need a clear layout, approved plan, and builder connections.',
    Icon: IconHome,
  },
  {
    key: 'retirement',
    span: 'retirement',
    name: 'Quiet retirement',
    description:
      'Seeking calm surroundings, easy access to care, and a lasting place to settle.',
    Icon: IconLeaf,
  },
]

export default function LifeStageMatch({ property }) {
  const [selected, setSelected] = useState('family')
  const match = property.lifeStageMatch[selected]
  const activeGoal = GOALS.find((goal) => goal.key === selected)

  return (
    <section className="pd-life" aria-labelledby="pd-life-title">
      <div className="pd-life__frame">
        <header className="pd-life__intro">
          <p className="pd-life__eyebrow">Life stage match</p>
          <h2 id="pd-life-title" className="pd-life__heading">
            Is this plot right for you?
          </h2>
          <p className="pd-life__lede">
            Select your situation — we&apos;ll show how well this layout fits,
            with an honest match score and one clear reason.
          </p>
        </header>

        <div className="pd-life__body">
          <div className="pd-life__stages" role="list" aria-label="Life stage goals">
            {GOALS.map((goal) => {
              const isActive = goal.key === selected
              return (
                <button
                  key={goal.key}
                  type="button"
                  role="listitem"
                  className={`pd-life__stage pd-life__stage--${goal.span}${isActive ? ' is-active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => setSelected(goal.key)}
                >
                  <span className="pd-life__stage-icon" aria-hidden="true">
                    <goal.Icon />
                  </span>
                  <span className="pd-life__stage-name">{goal.name}</span>
                  <span className="pd-life__stage-desc">{goal.description}</span>
                  <span className="pd-life__stage-foot">
                    <span className="pd-life__stage-cta">
                      <span className="pd-life__stage-cta-label">
                        {isActive ? 'Selected' : 'Select'}
                      </span>
                      <span className="pd-life__stage-arrow" aria-hidden="true">
                        <IconArrow />
                      </span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <aside className="pd-life__results" aria-live="polite">
            <div className="pd-life__results-head">
              <div>
                <p className="pd-life__results-kicker">Fit result</p>
                <h3 className="pd-life__results-title">{activeGoal?.name}</h3>
              </div>
            </div>

            <div className="pd-life__result-body">
              <div
                className="pd-life__circle"
                style={{ '--match': match.percent }}
                role="img"
                aria-label={`${match.percent} percent fit`}
              >
                <div className="pd-life__circle-inner">
                  <span className="pd-life__percent" key={match.percent}>
                    {match.percent}%
                  </span>
                  <span className="pd-life__match-label">fit</span>
                </div>
              </div>
              <p className="pd-life__reason" key={selected}>
                {match.reason}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
