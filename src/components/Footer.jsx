import { Link } from 'react-router-dom'
import { footerLinks } from '../data/site'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <p className="footer__name">ILA HOMES</p>
          <p className="footer__tagline">
            Verified properties across Telangana.
          </p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          {footerLinks.map((link) =>
            link.href.startsWith('/') && !link.href.includes('#') ? (
              <Link key={link.href} to={link.href}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ),
          )}
        </nav>
      </div>
    </footer>
  )
}
