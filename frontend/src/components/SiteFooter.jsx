import { Link, NavLink } from 'react-router-dom';
import { siteNavigation } from '../config/siteNavigation';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link to="/" className="footer-brand">
          Laguna Salud
        </Link>

        <nav className="footer-links" aria-label="Enlaces del footer">
          {siteNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `footer-link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="footer-utilities">
          <Link to="/contacto" className="footer-utility-link">
            Contacto
          </Link>
          <Link to="/login" className="footer-utility-link">
            Login
          </Link>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>Copyright {year} Laguna Salud</p>
        <Link to="/reservar-hora" className="footer-bottom-link">
          Reservar hora
        </Link>
      </div>
    </footer>
  );
}
