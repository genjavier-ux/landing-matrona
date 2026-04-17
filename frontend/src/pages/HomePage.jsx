import { useEffect, useState } from 'react';
import {
  createTestimonial,
  fetchPublicContent,
  sendContact,
  subscribe
} from '../services/api';

const initialContact = { name: '', email: '', phone: '', message: '' };
const initialReview = { patientNameAlias: '', content: '', reviewCode: '' };

export default function HomePage() {
  const [content, setContent] = useState(null);
  const [contactForm, setContactForm] = useState(initialContact);
  const [reviewForm, setReviewForm] = useState(initialReview);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchPublicContent()
      .then(setContent)
      .catch(() => setNotice('No se pudo cargar el contenido inicial.'));
  }, []);

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

  return (
    <main className="layout">
      <section className="hero-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-dot">M</span>
            <span>Matrona Contigo</span>
          </div>
          <nav>
            <a href="#servicios">Servicios</a>
            <a href="#comentarios">Comentarios</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </header>

        <section className="hero card">
          <div className="hero-copy">
            <span className="eyebrow">Matrona en Chile</span>
            <h1>{content?.hero?.title || 'Matrona Contigo'}</h1>
            <p>{content?.hero?.description || 'Acompañamiento cálido en cada etapa.'}</p>
            <div className="hero-actions">
              <a href="#contacto" className="cta-button">Solicitar contacto</a>
              <a href="#servicios" className="ghost-button">Ver servicios</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-bubble hero-bubble-main" />
            <div className="hero-bubble hero-bubble-soft" />
            <div className="hero-card">
              <h3>Atención cercana</h3>
              <p>Controles, educación y apoyo para mujeres y familias.</p>
            </div>
          </div>
        </section>
      </section>

      <section id="servicios" className="card section-card">
        <h2>Servicios</h2>
        <p className="section-lead">Atención integral con enfoque humano, respetuoso y actualizado.</p>
        <div className="grid">
          {content?.services?.map((service) => (
            <article className="service-card" key={service.id}>
              <img src={service.imageUrl} alt={service.title} />
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="comentarios" className="card section-card">
        <h2>Comentarios de pacientes</h2>
        <ul className="testimonial-list">
          {content?.testimonials?.map((item) => (
            <li key={item.id}>
              <strong>{item.patientNameAlias}</strong>
              <p>{item.content}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={handleReview} className="stack-form">
          <h3>Escribir comentario</h3>
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

      <section id="contacto" className="card section-card">
        <h2>Contacto</h2>
        <form onSubmit={handleSubmitContact} className="stack-form">
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

      <section className="card section-card">
        <h2>Suscríbete a novedades</h2>
        <p className="section-lead">Recibe consejos, talleres y contenidos educativos para tu etapa.</p>
        <form onSubmit={handleSubscribe} className="inline-form">
          <input type="email" required name="email" placeholder="correo@ejemplo.cl" />
          <button type="submit">Suscribirme</button>
        </form>
      </section>

      <section className="card section-card">
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
