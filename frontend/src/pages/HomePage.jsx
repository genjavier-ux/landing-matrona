import { Link } from 'react-router-dom';
import usePublicContent from '../hooks/usePublicContent';

const sectionLinks = [
  { to: '/sobre-mi', label: 'Sobre mi' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/comentarios', label: 'Comentarios' },
  { to: '/contacto', label: 'Contacto' }
];

export default function HomePage() {
  const { content, statusMessage } = usePublicContent();

  return (
    <div className="home-page">
      <section className="hero-section section-shell">
        <div className="hero-copy">
          <span className="section-tag">Laguna Salud</span>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.description}</p>

          <div className="hero-actions">
            <Link to="/reservar-hora" className="button button-primary">
              Reservar hora
            </Link>
            <Link to="/login" className="button button-secondary">
              Login
            </Link>
          </div>

          {statusMessage ? <p className="status-note">{statusMessage}</p> : null}
        </div>

        <div className="hero-visual">
          <div className="hero-frame hero-frame-back" />
          <div className="hero-frame hero-frame-front" />
          <div className="hero-glass-card hero-glass-card-top">
            <span className="hero-glass-label">Reserva simple</span>
            <strong>Atencion online y presencial</strong>
          </div>
          <img src="/hero-matrona.png" alt="Profesional de la salud" className="hero-image" />
          <div className="hero-glass-card hero-glass-card-bottom">
            <span className="hero-glass-label">Experiencia</span>
            <strong>Diseño limpio con efecto vidrio</strong>
          </div>
        </div>
      </section>

      <section className="flow-section section-shell">
        <div className="flow-block">
          <span className="flow-label">Paginas</span>
          <div className="flow-links">
            {sectionLinks.map((link) => (
              <Link key={link.to} to={link.to} className="flow-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flow-block">
          <span className="flow-label">Servicios</span>
          <div className="service-line">
            {(content.services || []).map((service) => (
              <span key={service.id} className="service-chip">
                {service.title}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
