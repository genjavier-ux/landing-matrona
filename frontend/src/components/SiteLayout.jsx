import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import SiteFooter from './SiteFooter';
import { siteNavigation } from '../config/siteNavigation';

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem('matrona-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function SiteLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('matrona-theme', theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
    setHasSession(Boolean(window.localStorage.getItem('matrona-token')));
  }, [location.pathname]);

  const authTarget = hasSession ? '/admin' : '/login';
  const authLabel = hasSession ? 'Panel' : 'Login';

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-nav">
          <NavLink to="/" className="brand-mark">
            Laguna Salud
          </NavLink>

          <button
            type="button"
            className={`nav-toggle ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((currentValue) => !currentValue)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`nav-group ${menuOpen ? 'is-open' : ''}`}>
            <nav className="nav-links" aria-label="Navegacion principal">
              {siteNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="nav-actions">
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setTheme((currentValue) => (currentValue === 'light' ? 'dark' : 'light'))}
                aria-label="Cambiar tema"
              >
                <span className="theme-toggle-track">
                  <span className="theme-toggle-thumb" />
                </span>
                <span>{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
              </button>

              <NavLink to={authTarget} className="button button-primary nav-login">
                {authLabel}
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
