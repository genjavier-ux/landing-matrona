import { useState } from 'react';
import usePublicContent from '../hooks/usePublicContent';
import { sendContact } from '../services/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  message: ''
};

const splitParagraphs = (value) =>
  String(value || '')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function ContactPage() {
  const { content, statusMessage } = usePublicContent();
  const [form, setForm] = useState(initialForm);
  const [formStatus, setFormStatus] = useState({
    type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactSection = content.sections.contact;
  const paragraphs = splitParagraphs(contactSection.content);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentValue) => ({
      ...currentValue,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormStatus({
      type: '',
      message: ''
    });

    try {
      const response = await sendContact(form);
      setForm(initialForm);
      setFormStatus({
        type: 'success',
        message: response.message || 'Mensaje enviado correctamente.'
      });
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: error.response?.data?.message || 'No fue posible enviar el mensaje.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="content-page section-shell">
      <div className="content-page-grid">
        <div className="content-page-copy">
          <span className="section-tag">Contacto</span>
          <h1>{contactSection.title}</h1>

          <div className="page-prose">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="contact-links">
            {(content.socialLinks || []).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="social-link"
              >
                {link.platform}
              </a>
            ))}
          </div>

          {statusMessage ? <p className="status-note">{statusMessage}</p> : null}
        </div>

        <form className="content-form-card" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label className="field">
              <span>Nombre</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </label>

            <label className="field">
              <span>Correo</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nombre@correo.com"
                required
              />
            </label>

            <label className="field">
              <span>Telefono</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+56 9 ..."
              />
            </label>
          </div>

          <label className="field">
            <span>Mensaje</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Escribe tu consulta"
              required
            />
          </label>

          {formStatus.message ? (
            <p className={`form-status ${formStatus.type}`}>{formStatus.message}</p>
          ) : null}

          <button type="submit" className="button button-primary submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </form>
      </div>
    </section>
  );
}
