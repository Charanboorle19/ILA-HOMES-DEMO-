import { useEffect, useState } from 'react'
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

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
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
          className={`nav__toggle ${open ? 'is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className={`nav__drawer ${open ? 'is-open' : ''}`}>
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
        <Link className="btn btn--solid" to="/#contact" onClick={close}>
          Talk to us
        </Link>
      </div>
    </header>
  )
}
