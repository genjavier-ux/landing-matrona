import usePublicContent from '../hooks/usePublicContent';

const splitParagraphs = (value) =>
  String(value || '')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function ServicesPage() {
  const { content, statusMessage } = usePublicContent();
  const servicesSection = content.sections.services;
  const paragraphs = splitParagraphs(servicesSection.content);

  return (
    <section className="content-page section-shell">
      <div className="content-page-copy services-page-copy">
        <span className="section-tag">Servicios</span>
        <h1>{servicesSection.title}</h1>

        <div className="page-prose">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {statusMessage ? <p className="status-note">{statusMessage}</p> : null}
      </div>

      <div className="services-public-grid">
        {(content.services || []).map((service) => (
          <article key={service.id} className="service-public-card">
            <div className="service-public-header">
              <div>
                <strong>{service.title}</strong>
                <span>{service.durationMinutes} min</span>
              </div>

              <span className="service-public-price">
                {service.currency} {Number(service.price || 0).toLocaleString('es-CL')}
              </span>
            </div>

            <p>{service.description}</p>

            {service.imageUrl ? (
              <div className="service-public-image-wrap">
                <img src={service.imageUrl} alt={service.title} className="service-public-image" />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
