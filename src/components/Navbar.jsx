import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router-dom'
import { navLinks } from '../data/site'

function isRouteLink(href) {
  return href.startsWith('/') && !href.includes('#')
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  const menu =
    typeof document !== 'undefined'
      ? createPortal(
          <>
            <button
              type="button"
              className={`nav__backdrop${open ? ' is-open' : ''}`}
              aria-label="Close menu"
              tabIndex={open ? 0 : -1}
              onClick={close}
            />
            <div
              className={`nav__drawer${open ? ' is-open' : ''}`}
              id="nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              aria-hidden={!open}
            >
              <div className="nav__drawer-top">
                <p className="nav__drawer-label">Menu</p>
                <button
                  type="button"
                  className="nav__drawer-close"
                  aria-label="Close menu"
                  onClick={close}
                >
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                </button>
              </div>

              <nav className="nav__drawer-links" aria-label="Mobile">
                {navLinks.map((link) =>
                  isRouteLink(link.href) ? (
                    <NavLink
                      key={link.href}
                      to={link.href}
                      onClick={close}
                      className={({ isActive }) => (isActive ? 'is-active' : undefined)}
                    >
                      {link.label}
                    </NavLink>
                  ) : (
                    <Link key={link.href} to={link.href} onClick={close}>
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>

              <Link className="nav__drawer-cta" to="/#contact" onClick={close}>
                <span className="nav__drawer-cta-copy">
                  <span className="nav__drawer-cta-kicker">Ready to talk?</span>
                  <span className="nav__drawer-cta-label">Talk to us</span>
                </span>
                <span className="nav__drawer-cta-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </>,
          document.body,
        )
      : null

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}${open ? ' is-menu-open' : ''}`}>
      <div className="nav__inner">
        <Link className="nav__brand" to="/" onClick={close}>
          ILA HOMES
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {navLinks.map((link) =>
            isRouteLink(link.href) ? (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              >
                {link.label}
              </NavLink>
            ) : (
              <Link key={link.href} to={link.href}>
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <Link className="nav__cta btn btn--solid" to="/#contact">
          Talk to us
        </Link>

        <button
          type="button"
          className={`nav__toggle${open ? ' is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      {menu}
    </header>
  )
}
