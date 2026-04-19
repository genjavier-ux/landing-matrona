import usePublicContent from '../hooks/usePublicContent';

const splitParagraphs = (value) =>
  String(value || '')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function AboutPage() {
  const { content, statusMessage } = usePublicContent();
  const aboutSection = content.sections.about;
  const paragraphs = splitParagraphs(aboutSection.content);

  return (
    <section className="content-page section-shell">
      <div className="content-page-grid">
        <div className="content-page-copy">
          <span className="section-tag">Sobre mi</span>
          <h1>{aboutSection.title}</h1>

          <div className="page-prose">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {statusMessage ? <p className="status-note">{statusMessage}</p> : null}
        </div>

        <aside className="content-page-aside">
          <div className="content-aside-card">
            <span className="flow-label">Atencion</span>
            <strong>{content.services.length} servicios activos</strong>
            <p>Prestaciones pensadas para acompanamiento, seguimiento y orientacion continua.</p>
          </div>

          <div className="content-aside-card">
            <span className="flow-label">Confianza</span>
            <strong>{content.testimonials.length} testimonios visibles</strong>
            <p>Experiencias reales que refuerzan un trato cercano, claro y profesional.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
