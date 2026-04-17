import { useEffect, useMemo, useState } from 'react';
import {
  createTestimonial,
  fetchPublicContent,
  sendContact,
  subscribe
} from '../services/api';

const initialContact = { name: '', email: '', phone: '', message: '' };
const initialReview = { patientNameAlias: '', content: '', reviewCode: '' };

function Icon({ children }) {
  return <span className="icon-chip" aria-hidden>{children}</span>;
}

function BrokenImagePlaceholder({ label }) {
  return (
    <div className="image-fallback" role="img" aria-label={`${label} sin imagen`}>
      <svg viewBox="0 0 24 24" className="image-fallback-icon" aria-hidden>
        <path d="M21 5v14H3V5h18zm0-2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
        <path d="m8.5 13.5 2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        <circle cx="8" cy="8" r="1.7" />
      </svg>
      <p>Imagen no disponible</p>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <main className="layout skeleton-page">
      <section className="hero-shell shimmer" />
      <section className="flow-section shimmer short" />
      <section className="flow-section shimmer short" />
      <section className="flow-section shimmer short" />
    </main>
  );
}

export default function HomePage() {
  const [content, setContent] = useState(null);
  const [contactForm, setContactForm] = useState(initialContact);
  const [reviewForm, setReviewForm] = useState(initialReview);
  const [notice, setNotice] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    fetchPublicContent()
      .then((response) => setContent(response))
      .catch(() => setNotice('No se pudo cargar el contenido inicial.'));
  }, []);

  useEffect(() => {
    if (!content?.testimonials?.length) return;

    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % content.testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [content?.testimonials]);

  useEffect(() => {
    const sections = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [content]);

  const currentTestimonial = useMemo(() => {
    if (!content?.testimonials?.length) return null;
    return content.testimonials[activeTestimonial];
  }, [content, activeTestimonial]);

  const handleSubmitContact = async (event) => {
    event.preventDefault();
    await sendContact(contactForm);
    setContactForm(initialContact);
    setNotice('Gracias. Te contactaremos muy pronto.');
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    await subscribe({ email });
    event.currentTarget.reset();
    setNotice('Suscripción registrada con éxito.');
  };

  const handleReview = async (event) => {
    event.preventDefault();
    await createTestimonial(reviewForm);
    setReviewForm(initialReview);
    setNotice('Comentario enviado para moderación.');
  };

  if (!content) return <HomeSkeleton />;

  return (
    <main className="layout">
      <section className="hero-shell" data-reveal>
        <header className="topbar">
          <div className="brand">
            <span className="brand-dot">M</span>
            <div>
              <strong>Matrona Contigo</strong>
              <small>Chile</small>
            </div>
          </div>
          <nav>
            <a href="#servicios">Servicios</a>
            <a href="#comentarios">Comentarios</a>
            <a href="#contacto">Contacto</a>
            <a href="/admin" className="login-link">Login</a>
          </nav>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Acompañamiento profesional y humano</span>
            <h1>{content?.hero?.title || 'Matrona Contigo'}</h1>
            <p>{content?.hero?.description || 'Acompañamiento cálido en cada etapa.'}</p>
            <div className="hero-actions">
              <a href="#contacto" className="cta-button">Solicitar contacto</a>
              <a href="#servicios" className="ghost-button">Explorar servicios</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-bubble hero-bubble-main" />
            <div className="hero-bubble hero-bubble-soft" />
            <div className="hero-card">
              <h3>Contigo en cada etapa</h3>
              <p>Gestación, postparto, lactancia y educación personalizada para la familia.</p>
            </div>
          </div>
        </section>
      </section>

      <section id="servicios" className="flow-section" data-reveal>
        <h2>Servicios</h2>
        <p className="section-lead">Atención integral con enfoque respetuoso, cercano y actualizado.</p>
        <div className="grid">
          {content?.services?.map((service) => (
            <article className="service-card" key={service.id}>
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'grid';
                  }}
                />
              ) : null}
              <div className="fallback-holder" style={{ display: service.imageUrl ? 'none' : 'grid' }}>
                <BrokenImagePlaceholder label={service.title} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="comentarios" className="flow-section" data-reveal>
        <h2>Comentarios de pacientes</h2>
        <div className="testimonial-carousel">
          {currentTestimonial ? (
            <article key={currentTestimonial.id} className="testimonial-active">
              <p>“{currentTestimonial.content}”</p>
              <strong>{currentTestimonial.patientNameAlias}</strong>
            </article>
          ) : (
            <article className="testimonial-active">
              <p>Aún no hay comentarios aprobados.</p>
            </article>
          )}

          {!!content?.testimonials?.length && (
            <div className="carousel-controls">
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonial(
                    (prev) => (prev - 1 + content.testimonials.length) % content.testimonials.length
                  )
                }
              >
                ‹
              </button>
              <div className="carousel-dots">
                {content.testimonials.map((item, index) => (
                  <button
                    type="button"
                    key={item.id}
                    className={index === activeTestimonial ? 'dot active' : 'dot'}
                    onClick={() => setActiveTestimonial(index)}
                    aria-label={`Ir al comentario ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % content.testimonials.length)}
              >
                ›
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleReview} className="stack-form glass-panel">
          <h3>Deja tu comentario</h3>
          <input
            required
            placeholder="Nombre o iniciales"
            value={reviewForm.patientNameAlias}
            onChange={(e) =>
              setReviewForm((prev) => ({ ...prev, patientNameAlias: e.target.value }))
            }
          />
          <textarea
            required
            placeholder="Tu experiencia"
            value={reviewForm.content}
            onChange={(e) => setReviewForm((prev) => ({ ...prev, content: e.target.value }))}
          />
          <input
            required
            placeholder="Código de validación"
            value={reviewForm.reviewCode}
            onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewCode: e.target.value }))}
          />
          <button type="submit">Enviar comentario</button>
        </form>
      </section>

      <section id="contacto" className="flow-section split" data-reveal>
        <div>
          <h2>Contacto</h2>
          <p className="section-lead">Responderé tu mensaje lo antes posible para orientarte en tu proceso.</p>
          <ul className="contact-bullets">
            <li><Icon>📍</Icon> Atención online y presencial en Chile</li>
            <li><Icon>💬</Icon> Acompañamiento continuo y educación clara</li>
            <li><Icon>🫶</Icon> Trato respetuoso, cálido y personalizado</li>
          </ul>
        </div>

        <form onSubmit={handleSubmitContact} className="stack-form glass-panel">
          <input
            required
            placeholder="Nombre"
            value={contactForm.name}
            onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            required
            type="email"
            placeholder="Correo"
            value={contactForm.email}
            onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            placeholder="Teléfono"
            value={contactForm.phone}
            onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <textarea
            required
            placeholder="Mensaje"
            value={contactForm.message}
            onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
          />
          <button type="submit">Enviar</button>
        </form>
      </section>

      <section className="flow-section split" data-reveal>
        <div>
          <h2>Suscríbete a novedades</h2>
          <p className="section-lead">Recibe consejos, talleres y contenido educativo en tu correo.</p>
        </div>
        <form onSubmit={handleSubscribe} className="inline-form glass-panel">
          <input type="email" required name="email" placeholder="correo@ejemplo.cl" />
          <button type="submit">Suscribirme</button>
        </form>
      </section>

      <section className="flow-section" data-reveal>
        <h2>Redes sociales</h2>
        <p className="section-lead">Contenido educativo para matronas, mamás y familias.</p>
        <div className="social-links">
          {content?.socialLinks?.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noreferrer">
              {link.platform}
            </a>
          ))}
        </div>
      </section>

      {notice && <p className="notice">{notice}</p>}
    </main>
  );
}
