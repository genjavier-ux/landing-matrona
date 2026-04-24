import { Link } from 'react-router-dom';
import usePublicContent from '../hooks/usePublicContent';

const defaultPortrait = {
  id: 'default-portrait',
  title: 'Presentacion principal',
  description: 'La primera foto activa que suba la usuaria se usa aqui como retrato principal.',
  imageUrl: '/hero-matrona.png'
};

const splitParagraphs = (value) =>
  String(value || '')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

const truncateText = (value, maxLength = 160) => {
  const safeValue = String(value || '').trim();

  if (safeValue.length <= maxLength) {
    return safeValue;
  }

  return `${safeValue.slice(0, maxLength).trimEnd()}...`;
};

const formatCountLabel = (count, singular, plural) =>
  `${count} ${count === 1 ? singular : plural}`;

export default function HomePage() {
  const { content, statusMessage } = usePublicContent();
  const aboutSection = content.sections.about;
  const bookingSection = content.sections.booking;

  const portraitGallery = (content.gallery || []).filter((item) => item.imageUrl);
  const primaryPortrait = portraitGallery[0] || defaultPortrait;
  const portraitHighlights = portraitGallery.slice(1, 4);

  const aboutParagraphs = splitParagraphs(aboutSection.content);
  const aboutLead =
    aboutParagraphs[0] ||
    'Acompanamiento profesional con una mirada cercana, clara y humana en cada etapa.';
  const aboutSupport =
    aboutParagraphs[1] ||
    'La home funciona como una presentacion directa para mostrar rostro, estilo de atencion y servicios principales.';
  const bookingPreview =
    splitParagraphs(bookingSection.content)[0] ||
    'Selecciona dia y horario disponible desde una agenda conectada con la disponibilidad real.';

  const enabledBookingDays = (content.weeklyAvailability || []).length;

  const quickMetrics = [
    {
      value: formatCountLabel(content.services.length, 'servicio', 'servicios'),
      label: 'activos'
    },
    {
      value: formatCountLabel(content.testimonials.length, 'testimonio', 'testimonios'),
      label: 'visibles'
    },
    {
      value: enabledBookingDays ? formatCountLabel(enabledBookingDays, 'dia', 'dias') : 'Agenda',
      label: enabledBookingDays ? 'con reserva online' : 'online disponible'
    }
  ];

  return (
    <div className="home-page presentation-home">
      <section className="presentation-hero section-shell">
        <div className="presentation-hero-copy">
          <span className="section-tag">Presentacion</span>

          <div className="presentation-hero-kicker">
            <span className="presentation-hero-kicker-line" aria-hidden="true" />
            <p>Atencion cercana, clara y con una imagen principal editable desde el panel</p>
          </div>

          <h1>{content.hero.title}</h1>
          <p className="presentation-hero-description">{content.hero.description}</p>

          <div className="presentation-hero-summary">
            <article className="presentation-summary-card">
              <span className="flow-label">Sobre mi</span>
              <strong>{aboutSection.title}</strong>
              <p>{truncateText(aboutLead, 150)}</p>
            </article>

            <article className="presentation-summary-card is-soft">
              <span className="flow-label">Reserva</span>
              <strong>
                {enabledBookingDays
                  ? `${enabledBookingDays} dias con agenda online`
                  : 'Agenda online disponible'}
              </strong>
              <p>{truncateText(bookingPreview, 150)}</p>
            </article>
          </div>

          <div className="hero-actions">
            <Link to="/reservar-hora" className="button button-primary">
              Reservar hora
            </Link>
            <Link to="/contacto" className="button button-secondary">
              Ir a contacto
            </Link>
          </div>

          <div className="presentation-hero-metrics" aria-label="Resumen del sitio">
            {quickMetrics.map((metric) => (
              <article key={`${metric.value}-${metric.label}`} className="presentation-metric-card">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>

          {statusMessage ? <p className="status-note">{statusMessage}</p> : null}
        </div>

        <div className="presentation-hero-media">
          <div className="presentation-photo-stage">
            <span className="presentation-photo-glow is-primary" aria-hidden="true" />
            <span className="presentation-photo-glow is-secondary" aria-hidden="true" />

            <article className="presentation-photo-card">
              <div className="presentation-photo-card-top">
                <span className="flow-label">Foto principal</span>
                <strong>{primaryPortrait.title || 'Retrato subido por la usuaria'}</strong>
                <p>
                  {primaryPortrait.description ||
                    'La primera imagen activa del hero se muestra aqui como retrato de presentacion.'}
                </p>
              </div>

              <div className="presentation-photo-frame">
                <img
                  src={primaryPortrait.imageUrl}
                  alt={primaryPortrait.title || 'Fotografia principal de la profesional'}
                />
              </div>
            </article>

            <div className="presentation-photo-note is-top">
              <span className="flow-label">Ideal para</span>
              <strong>Mostrar a la profesional con una imagen propia y actualizable</strong>
            </div>

            <div className="presentation-photo-note is-bottom">
              <span className="flow-label">Mensaje</span>
              <strong>{truncateText(aboutSupport, 88)}</strong>
            </div>

            {portraitHighlights.length ? (
              <div className="presentation-photo-rail" aria-label="Imagenes secundarias">
                {portraitHighlights.map((item) => (
                  <article key={item.id} className="presentation-photo-thumb">
                    <img src={item.imageUrl} alt={item.title || 'Visual secundario'} />

                    <div>
                      <strong>{item.title || 'Visual secundario'}</strong>
                      <span>{truncateText(item.description || aboutLead, 60)}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
