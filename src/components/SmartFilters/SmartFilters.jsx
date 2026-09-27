import { useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AMENITY_FEATURE_OPTIONS,
  FACING_OPTIONS,
  FILTER_BOUNDS,
  POSSESSION_OPTIONS,
  PROPERTY_TYPES,
  ROAD_WIDTH_OPTIONS,
  STATUS_OPTIONS,
  countActiveFilters,
  createDefaultFilters,
  describeFilters,
  getLocationOptions,
} from '../../lib/filters'
import { formatPrice } from '../../lib/format'
import { addInterest, getVisitorMobile, setVisitorMobile } from '../../lib/visitor'
import {
  deleteSavedSearch,
  getSavedSearches,
  saveSearch,
  updateSavedSearch,
} from '../../lib/savedSearches'
import './SmartFilters.css'

const PHONE_RE = /^[6-9]\d{9}$/

function DualRange({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  formatValue,
  label,
}) {
  const id = useId()
  const span = max - min || 1
  const left = ((valueMin - min) / span) * 100
  const right = ((valueMax - min) / span) * 100

  return (
    <div className="sf-range">
      <div className="sf-range__labels">
        <span>{label}</span>
        <strong>
          {formatValue(valueMin)} – {formatValue(valueMax)}
        </strong>
      </div>
      <div className="sf-range__track" style={{ '--left': `${left}%`, '--right': `${right}%` }}>
        <input
          id={`${id}-min`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          aria-label={`${label} minimum`}
          onChange={(event) => {
            const next = Math.min(Number(event.target.value), valueMax - step)
            onChange(next, valueMax)
          }}
        />
        <input
          id={`${id}-max`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          aria-label={`${label} maximum`}
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), valueMin + step)
            onChange(valueMin, next)
          }}
        />
      </div>
    </div>
  )
}

function ChipGroup({ label, options, selected, onToggle, getId = (o) => o, getLabel = (o) => o }) {
  return (
    <div className="sf-group">
      <p className="sf-group__label">{label}</p>
      <div className="sf-chips" role="group" aria-label={label}>
        {options.map((option) => {
          const id = getId(option)
          const isOn = selected.includes(id)
          return (
            <button
              key={id}
              type="button"
              className={`sf-chip${isOn ? ' is-on' : ''}`}
              aria-pressed={isOn}
              onClick={() => onToggle(id)}
            >
              {getLabel(option)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function toggleInList(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

function SaveSearchDialog({ open, filters, onClose, onSaved }) {
  const titleId = useId()
  const [name, setName] = useState('')
  const [notify, setNotify] = useState(true)
  const [frequency, setFrequency] = useState('instant')
  const [mobile, setMobile] = useState(getVisitorMobile())
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    setName('')
    setNotify(true)
    setFrequency('instant')
    setMobile(getVisitorMobile())
    setError('')
    setDone(false)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const chips = describeFilters(filters)

  function handleSubmit(event) {
    event.preventDefault()
    if (notify) {
      if (!PHONE_RE.test(mobile)) {
        setError('Enter a valid 10-digit mobile to get WhatsApp alerts.')
        return
      }
      setVisitorMobile(mobile)
    }

    const entry = saveSearch({
      name: name || chips.slice(0, 2).join(' · ') || 'My search',
      filters,
      notify,
      frequency,
      mobile: notify ? mobile : '',
      channel: 'whatsapp',
    })
    addInterest('save_search', 5, { searchId: entry.id })
    if (notify) addInterest('notify_opt_in', 3, { searchId: entry.id })
    setDone(true)
    onSaved?.(entry)
  }

  return createPortal(
    <div className="sf-modal" role="presentation">
      <button type="button" className="sf-modal__scrim" aria-label="Close" onClick={onClose} />
      <div className="sf-modal__dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="sf-modal__close" aria-label="Close" onClick={onClose}>
          ×
        </button>

        {done ? (
          <div className="sf-modal__done">
            <p className="sf-modal__eyebrow">Saved</p>
            <h2 id={titleId} className="sf-modal__title">
              We&apos;ll watch this for you
            </h2>
            <p className="sf-modal__copy">
              {notify
                ? `New matches will ping you on WhatsApp (+91 ${mobile}) — ${frequency} digest.`
                : 'Your search is saved. Turn on Notify anytime from Saved searches.'}
            </p>
            <button type="button" className="sf-modal__primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="sf-modal__form" onSubmit={handleSubmit} noValidate>
            <p className="sf-modal__eyebrow">Saved search</p>
            <h2 id={titleId} className="sf-modal__title">
              Save &amp; get notified
            </h2>
            <p className="sf-modal__copy">
              Keep this filter combo. Optional: WhatsApp when something new matches.
            </p>

            {chips.length > 0 ? (
              <div className="sf-modal__chips" aria-label="Current filters">
                {chips.slice(0, 8).map((chip) => (
                  <span key={chip} className="sf-pill">
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            <label className="sf-modal__field">
              <span>Name (optional)</span>
              <input
                type="text"
                placeholder='e.g. "My 30×40 east facing"'
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={48}
              />
            </label>

            <label className="sf-modal__toggle">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
              />
              <span>Notify me on WhatsApp</span>
            </label>

            {notify ? (
              <>
                <label className="sf-modal__field">
                  <span>Mobile number</span>
                  <span className="sf-modal__phone">
                    <span>+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                        setError('')
                      }}
                    />
                  </span>
                </label>

                <div className="sf-group">
                  <p className="sf-group__label">Frequency</p>
                  <div className="sf-chips" role="radiogroup" aria-label="Frequency">
                    {[
                      { id: 'instant', label: 'Instant' },
                      { id: 'daily', label: 'Daily digest' },
                      { id: 'weekly', label: 'Weekly' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`sf-chip${frequency === opt.id ? ' is-on' : ''}`}
                        aria-pressed={frequency === opt.id}
                        onClick={() => setFrequency(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {error ? (
              <p className="sf-modal__error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="sf-modal__primary">
              {notify ? 'Save & notify on WhatsApp' : 'Save search'}
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default function SmartFilters({
  properties,
  filters,
  onChange,
  resultCount,
}) {
  const [open, setOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [saved, setSaved] = useState(() => getSavedSearches())
  const locationOptions = useMemo(() => getLocationOptions(properties), [properties])
  const activeCount = countActiveFilters(filters)
  const summaryChips = describeFilters(filters)

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  function patch(partial) {
    onChange({ ...filters, ...partial })
  }

  function reset() {
    onChange(createDefaultFilters())
    addInterest('filter_reset', 0)
  }

  function applyAndClose() {
    addInterest('apply_filters', 2, { count: activeCount })
    setOpen(false)
  }

  function refreshSaved() {
    setSaved(getSavedSearches())
  }

  function loadSaved(entry) {
    onChange({ ...createDefaultFilters(), ...entry.filters })
    addInterest('load_saved_search', 2, { searchId: entry.id })
    setOpen(false)
  }

  return (
    <div className="sf">
      <div className="sf-bar">
        <button
          type="button"
          className={`sf-bar__open${activeCount ? ' has-active' : ''}`}
          onClick={() => setOpen(true)}
        >
          <span className="sf-bar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M7 12h10M10 18h4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Filters
          {activeCount > 0 ? <span className="sf-bar__count">{activeCount}</span> : null}
        </button>

        <p className="sf-bar__count-label">
          <strong>{resultCount}</strong>{' '}
          {resultCount === 1 ? 'property' : 'properties'}
        </p>

        <div className="sf-bar__actions">
          {activeCount > 0 ? (
            <>
              <button type="button" className="sf-bar__ghost" onClick={reset}>
                Clear
              </button>
              <button
                type="button"
                className="sf-bar__save"
                onClick={() => setSaveOpen(true)}
              >
                Save search
              </button>
            </>
          ) : null}
        </div>
      </div>

      {summaryChips.length > 0 ? (
        <div className="sf-active" aria-label="Active filters">
          {summaryChips.map((chip) => (
            <span key={chip} className="sf-pill">
              {chip}
            </span>
          ))}
        </div>
      ) : null}

      {saved.length > 0 ? (
        <div className="sf-saved" aria-label="Saved searches">
          <span className="sf-saved__label">Saved</span>
          <div className="sf-saved__row">
            {saved.map((entry) => (
              <div key={entry.id} className="sf-saved__item">
                <button
                  type="button"
                  className="sf-saved__btn"
                  onClick={() => loadSaved(entry)}
                >
                  {entry.name}
                  {entry.notify ? <span className="sf-saved__bell" title="Notifications on">●</span> : null}
                </button>
                <button
                  type="button"
                  className="sf-saved__x"
                  aria-label={`Remove ${entry.name}`}
                  onClick={() => {
                    deleteSavedSearch(entry.id)
                    refreshSaved()
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="sf-drawer" role="dialog" aria-modal="true" aria-label="Property filters">
          <button
            type="button"
            className="sf-drawer__scrim"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div className="sf-drawer__panel">
            <header className="sf-drawer__head">
              <div>
                <p className="sf-drawer__eyebrow">Smart filters</p>
                <h2 className="sf-drawer__title">Dial in your plot</h2>
              </div>
              <button
                type="button"
                className="sf-drawer__close"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="sf-drawer__body">
              <DualRange
                label="Price"
                min={FILTER_BOUNDS.price.min}
                max={FILTER_BOUNDS.price.max}
                step={FILTER_BOUNDS.price.step}
                valueMin={filters.priceMin}
                valueMax={filters.priceMax}
                formatValue={formatPrice}
                onChange={(priceMin, priceMax) => patch({ priceMin, priceMax })}
              />

              <DualRange
                label="Area (sq.ft)"
                min={FILTER_BOUNDS.areaSqFt.min}
                max={FILTER_BOUNDS.areaSqFt.max}
                step={FILTER_BOUNDS.areaSqFt.step}
                valueMin={filters.areaMin}
                valueMax={filters.areaMax}
                formatValue={(n) => `${n.toLocaleString('en-IN')}`}
                onChange={(areaMin, areaMax) => patch({ areaMin, areaMax })}
              />

              <ChipGroup
                label="Property type"
                options={PROPERTY_TYPES}
                selected={filters.propertyTypes}
                onToggle={(id) =>
                  patch({ propertyTypes: toggleInList(filters.propertyTypes, id) })
                }
              />

              <ChipGroup
                label="Possession"
                options={POSSESSION_OPTIONS}
                selected={filters.possession}
                getId={(o) => o.id}
                getLabel={(o) => o.label}
                onToggle={(id) =>
                  patch({ possession: toggleInList(filters.possession, id) })
                }
              />

              <ChipGroup
                label="Facing"
                options={FACING_OPTIONS}
                selected={filters.facing}
                onToggle={(id) => patch({ facing: toggleInList(filters.facing, id) })}
              />

              <ChipGroup
                label="Road width"
                options={ROAD_WIDTH_OPTIONS}
                selected={filters.roadWidths}
                getId={(o) => o.id}
                getLabel={(o) => o.label}
                onToggle={(id) =>
                  patch({ roadWidths: toggleInList(filters.roadWidths, id) })
                }
              />

              <ChipGroup
                label="Location / Project"
                options={locationOptions}
                selected={filters.locations}
                getId={(o) => o.id}
                getLabel={(o) => o.label}
                onToggle={(id) =>
                  patch({ locations: toggleInList(filters.locations, id) })
                }
              />

              <ChipGroup
                label="Amenities"
                options={AMENITY_FEATURE_OPTIONS}
                selected={filters.amenities}
                getId={(o) => o.id}
                getLabel={(o) => o.label}
                onToggle={(id) =>
                  patch({ amenities: toggleInList(filters.amenities, id) })
                }
              />

              <ChipGroup
                label="Status"
                options={STATUS_OPTIONS}
                selected={filters.statuses}
                getId={(o) => o.id}
                getLabel={(o) => o.label}
                onToggle={(id) =>
                  patch({ statuses: toggleInList(filters.statuses, id) })
                }
              />

              <div className="sf-group">
                <p className="sf-group__label">High-value flags</p>
                <div className="sf-chips" role="group" aria-label="High-value flags">
                  {[
                    ['cornerOnly', 'Corner plot'],
                    ['parkFacingOnly', 'Park facing'],
                    ['bankEligibleOnly', 'Bank eligible'],
                    ['reraOnly', 'RERA registered'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`sf-chip${filters[key] ? ' is-on' : ''}`}
                      aria-pressed={filters[key]}
                      onClick={() => patch({ [key]: !filters[key] })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sf-group">
                <p className="sf-group__label">Within highway distance</p>
                <div className="sf-chips" role="group" aria-label="Highway distance">
                  {[
                    { id: null, label: 'Any' },
                    { id: 1, label: '≤ 1 km' },
                    { id: 2, label: '≤ 2 km' },
                    { id: 5, label: '≤ 5 km' },
                  ].map((opt) => (
                    <button
                      key={String(opt.id)}
                      type="button"
                      className={`sf-chip${filters.highwayMaxKm === opt.id ? ' is-on' : ''}`}
                      aria-pressed={filters.highwayMaxKm === opt.id}
                      onClick={() => patch({ highwayMaxKm: opt.id })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {saved.length > 0 ? (
                <div className="sf-group sf-group--saved-manage">
                  <p className="sf-group__label">Your saved searches</p>
                  <ul className="sf-manage">
                    {saved.map((entry) => (
                      <li key={entry.id}>
                        <button type="button" onClick={() => loadSaved(entry)}>
                          {entry.name}
                        </button>
                        <button
                          type="button"
                          className="sf-manage__notify"
                          onClick={() => {
                            if (!entry.notify && !getVisitorMobile()) {
                              setSaveOpen(true)
                              return
                            }
                            updateSavedSearch(entry.id, {
                              notify: !entry.notify,
                              mobile: getVisitorMobile(),
                            })
                            refreshSaved()
                          }}
                        >
                          {entry.notify ? 'Mute' : 'Notify'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <footer className="sf-drawer__foot">
              <button type="button" className="sf-drawer__reset" onClick={reset}>
                Reset
              </button>
              <button
                type="button"
                className="sf-drawer__save"
                onClick={() => setSaveOpen(true)}
              >
                Save
              </button>
              <button type="button" className="sf-drawer__apply" onClick={applyAndClose}>
                Show {resultCount}
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      <SaveSearchDialog
        open={saveOpen}
        filters={filters}
        onClose={() => setSaveOpen(false)}
        onSaved={() => {
          refreshSaved()
        }}
      />
    </div>
  )
}
