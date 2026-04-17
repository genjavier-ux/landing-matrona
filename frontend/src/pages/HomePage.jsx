import { useEffect, useState } from 'react';
import { fetchPublicContent } from '../services/api';

const fallbackContent = {
  hero: {
    title: 'Matrona Contigo',
    description: 'Cuidado profesional, calido y cercano para cada etapa de tu maternidad.'
  }
};

const createMockServiceVisual = (title, subtitle, colorA, colorB) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="hero" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="100%" stop-color="${colorB}" />
        </linearGradient>
        <linearGradient id="panel" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#fff9fb" />
          <stop offset="100%" stop-color="#ffe8ef" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="#fffafb" />
      <circle cx="980" cy="150" r="160" fill="${colorB}" fill-opacity="0.26" />
      <circle cx="180" cy="720" r="210" fill="${colorA}" fill-opacity="0.18" />
      <rect x="120" y="120" width="960" height="660" rx="54" fill="url(#panel)" stroke="#f0d2dc" stroke-width="3" />
      <rect x="180" y="210" width="340" height="340" rx="42" fill="url(#hero)" fill-opacity="0.84" />
      <circle cx="350" cy="380" r="94" fill="#ffffff" fill-opacity="0.55" />
      <rect x="590" y="260" width="350" height="28" rx="14" fill="#df7d9a" fill-opacity="0.34" />
      <rect x="590" y="320" width="250" height="18" rx="9" fill="#c68ea0" fill-opacity="0.32" />
      <rect x="590" y="520" width="290" height="18" rx="9" fill="#c68ea0" fill-opacity="0.28" />
      <rect x="590" y="560" width="210" height="18" rx="9" fill="#c68ea0" fill-opacity="0.22" />
      <text x="590" y="410" fill="#2f2f33" font-size="78" font-family="Arial, sans-serif" font-weight="700">${title}</text>
      <text x="590" y="470" fill="#875f6e" font-size="34" font-family="Arial, sans-serif">${subtitle}</text>
    </svg>
  `)}`;

const buildGallery = (title, toneA, toneB) => [
  createMockServiceVisual(title, 'Evaluacion inicial', toneA, toneB),
  createMockServiceVisual(title, 'Acompanamiento cercano', toneB, toneA),
  createMockServiceVisual(title, 'Seguimiento personalizado', toneA, '#f9d2df')
];

const mockServices = [
  {
    id: 'mock-service-1',
    title: 'Control prenatal integral',
    description:
      'Acompanamiento durante el embarazo con seguimiento, orientacion clara y espacio para resolver dudas importantes.',
    imageUrl: createMockServiceVisual('Prenatal', 'Control integral', '#f6c9d8', '#ef8ea8'),
    gallery: buildGallery('Prenatal', '#f7c8d7', '#ef96ad')
  },
  {
    id: 'mock-service-2',
    title: 'Plan de parto consciente',
    description:
      'Preparacion para vivir el nacimiento con informacion, calma y decisiones alineadas con tus necesidades.',
    imageUrl: createMockServiceVisual('Parto', 'Plan personalizado', '#f5d3dd', '#eab0c4'),
    gallery: buildGallery('Parto', '#f5d3dd', '#e7a8bf')
  },
  {
    id: 'mock-service-3',
    title: 'Postparto respetado',
    description:
      'Contencion en los primeros dias para transitar cambios fisicos, emocionales y practicos con mas tranquilidad.',
    imageUrl: createMockServiceVisual('Postparto', 'Recuperacion guiada', '#f9dce5', '#f4b7ca')
  },
  {
    id: 'mock-service-4',
    title: 'Lactancia y agarre',
    description:
      'Apoyo para mejorar postura, agarre y confianza durante la lactancia, con acompanamiento practico y amable.',
    imageUrl: createMockServiceVisual('Lactancia', 'Apoyo practico', '#fce0e8', '#ef98b0'),
    gallery: buildGallery('Lactancia', '#fad6e1', '#ef98b0')
  },
  {
    id: 'mock-service-5',
    title: 'Salud menstrual',
    description:
      'Espacio para conversar tu ciclo, sintomas y bienestar desde una mirada cercana, respetuosa y profesional.',
    imageUrl: createMockServiceVisual('Ciclo', 'Bienestar femenino', '#f8d6e6', '#f4a8c3')
  },
  {
    id: 'mock-service-6',
    title: 'Suelo pelvico y recuperacion',
    description:
      'Guia y derivacion oportuna para apoyar el bienestar corporal despues del parto y en otras etapas de la vida.',
    imageUrl: createMockServiceVisual('Pelvico', 'Recuperacion', '#f5d7e0', '#f0a6bc'),
    gallery: buildGallery('Pelvico', '#f5d7e0', '#ec9fb8')
  },
  {
    id: 'mock-service-7',
    title: 'Preparacion para familias',
    description:
      'Sesiones para anticipar dudas sobre nacimiento, cuidados iniciales y organizacion emocional del hogar.',
    imageUrl: createMockServiceVisual('Familias', 'Preparacion previa', '#f5d9e6', '#eca8c0')
  },
  {
    id: 'mock-service-8',
    title: 'Consejeria en duelo gestacional',
    description:
      'Acompanamiento sensible para transitar procesos complejos con escucha, respeto y contencion real.',
    imageUrl: createMockServiceVisual('Duelo', 'Acompanamiento', '#f1d6df', '#e79cb4'),
    gallery: buildGallery('Duelo', '#f1d6df', '#e79cb4')
  },
  {
    id: 'mock-service-9',
    title: 'Charlas y talleres',
    description:
      'Instancias educativas para grupos, familias o equipos que necesitan informacion clara y cercana.',
    imageUrl: createMockServiceVisual('Talleres', 'Educacion cercana', '#f8dfea', '#efb4c7')
  },
  {
    id: 'mock-service-10',
    title: 'Asesoria online personalizada',
    description:
      'Consultas remotas para acompanarte desde cualquier lugar con la misma cercania y continuidad.',
    imageUrl: createMockServiceVisual('Online', 'Orientacion remota', '#f8d6df', '#ef90ac'),
    gallery: buildGallery('Online', '#f8d6df', '#ef90ac')
  }
];

const servicesPerPage = 4;

const mockTestimonials = [
  {
    id: 'mock-1',
    name: 'Camila R.',
    handle: '@camila.mama',
    quote: 'Me senti acompanada desde la primera consulta. Todo fue claro, amable y muy humano.',
    rating: 5
  },
  {
    id: 'mock-2',
    name: 'Valentina P.',
    handle: '@vale.postparto',
    quote: 'Transmitio muchisima calma. Resolvimos dudas de lactancia y sali con mucha confianza.',
    rating: 5
  },
  {
    id: 'mock-3',
    name: 'Daniela S.',
    handle: '@daniela.familia',
    quote: 'La atencion fue cercana y profesional. Se noto dedicacion real en cada detalle.',
    rating: 4
  },
  {
    id: 'mock-4',
    name: 'Paula M.',
    handle: '@paula.control',
    quote: 'Nos sentimos escuchados y contenidos. Fue una experiencia muy tranquila y respetuosa.',
    rating: 5
  },
  {
    id: 'mock-5',
    name: 'Fernanda T.',
    handle: '@fer.maternidad',
    quote: 'Muy clara para explicar y muy amorosa para acompanar. La recomendaria totalmente.',
    rating: 5
  }
];

const navItems = [
  { id: 'inicio', label: 'Home' },
  { id: 'sobre-mi', label: 'Sobre mi' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'comentarios', label: 'Comentarios' },
  { id: 'contacto', label: 'Contacto' }
];

const placeholderSections = [{ id: 'contacto', label: 'Contacto' }];

function HomeSkeleton() {
  return (
    <main className="clean-home">
      <div className="clean-home-loading">
        <div className="clean-loading-nav shimmer" />
        <div className="clean-loading-hero shimmer" />
        <div className="clean-loading-panel shimmer" />
      </div>
    </main>
  );
}

export default function HomePage() {
  const [content, setContent] = useState(fallbackContent);
  const [activeSection, setActiveSection] = useState('inicio');
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [galleryState, setGalleryState] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchPublicContent()
      .then((response) => {
        if (cancelled) return;

        setContent({
          ...fallbackContent,
          ...response,
          hero: {
            ...fallbackContent.hero,
            ...response?.hero
          }
        });
      })
      .catch(() => {
        if (!cancelled) {
          setNotice('No se pudo cargar el contenido online, pero deje el home listo para seguir disenando.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section-id]');

    if (!sections.length || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('visible');
          setActiveSection(entry.target.dataset.sectionId || 'inicio');
        });
      },
      {
        threshold: 0.55,
        rootMargin: '-16% 0px -28% 0px'
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isLoading]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % mockTestimonials.length);
    }, 3400);

    return () => clearInterval(timer);
  }, []);

  const services = mockServices;
  const safeActiveServiceIndex = Math.min(activeServiceIndex, Math.max(services.length - 1, 0));
  const activeService = services[safeActiveServiceIndex];
  const activeServicePage = Math.floor(safeActiveServiceIndex / servicesPerPage);
  const totalServicePages = Math.ceil(services.length / servicesPerPage);
  const servicePageStart = activeServicePage * servicesPerPage;
  const visibleServices = services.slice(servicePageStart, servicePageStart + servicesPerPage);
  const openGalleryService = galleryState ? services[galleryState.serviceIndex] : null;
  const activeGalleryImage = openGalleryService?.gallery?.[galleryState?.slideIndex || 0];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const getCardOffset = (index) => {
    const total = mockTestimonials.length;
    let offset = index - activeTestimonial;

    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    return offset;
  };

  const handleServicePageChange = (direction) => {
    const nextPage = (activeServicePage + direction + totalServicePages) % totalServicePages;
    setActiveServiceIndex(nextPage * servicesPerPage);
  };

  const openServiceGallery = (serviceIndex, slideIndex = 0) => {
    if (!services[serviceIndex]?.gallery?.length) return;

    setGalleryState({
      serviceIndex,
      slideIndex
    });
  };

  const closeServiceGallery = () => {
    setGalleryState(null);
  };

  const moveGallery = (direction) => {
    if (!openGalleryService?.gallery?.length) return;

    setGalleryState((prev) => ({
      ...prev,
      slideIndex: (prev.slideIndex + direction + openGalleryService.gallery.length) % openGalleryService.gallery.length
    }));
  };

  const handleServiceCardClick = (serviceIndex) => {
    setActiveServiceIndex(serviceIndex);

    if (services[serviceIndex]?.gallery?.length) {
      openServiceGallery(serviceIndex, 0);
    }
  };

  useEffect(() => {
    if (activeServiceIndex >= services.length) {
      setActiveServiceIndex(0);
    }
  }, [activeServiceIndex, services.length]);

  useEffect(() => {
    if (!galleryState) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeServiceGallery();
      if (event.key === 'ArrowRight') moveGallery(1);
      if (event.key === 'ArrowLeft') moveGallery(-1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryState, openGalleryService]);

  if (isLoading) return <HomeSkeleton />;

  return (
    <main className="clean-home">
      <header className="clean-nav">
        <nav className="clean-menu" aria-label="Principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? 'clean-menu-link active' : 'clean-menu-link'}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <a href="/admin" className="clean-login-link">
          Login
        </a>
      </header>

      <section id="inicio" className="clean-hero clean-scroll-section visible" data-section-id="inicio">
        <div className="clean-hero-copy">
          <span className="clean-eyebrow">{content.hero.title}</span>
          <h1>ACOMPANAMIENTO CERCANO</h1>
          <p className="clean-hero-description">{content.hero.description}</p>

          <div className="clean-hero-actions">
            <button type="button" className="clean-primary-button" onClick={() => handleNavClick('servicios')}>
              Ver servicios
            </button>
            <button type="button" className="clean-secondary-link" onClick={() => handleNavClick('sobre-mi')}>
              Ver sobre mi
            </button>
          </div>
        </div>

        <div className="clean-hero-art">
          <div className="clean-hero-circle" />
          <div className="clean-hero-portrait-shell">
            <img
              className="clean-hero-portrait"
              src="/hero-matrona.png"
              alt="Matrona sonriendo"
            />
          </div>
        </div>
      </section>

      <section id="sobre-mi" className="about-hero clean-scroll-section" data-section-id="sobre-mi">
        <div className="about-hero-copy">
          <span className="clean-eyebrow">Sobre mi</span>
          <h1>UNA PRESENCIA CERCANA Y PROFESIONAL</h1>
          <p className="about-hero-lead">
            Este bloque presenta quien eres, como acompanas y el tono humano con el que quieres
            recibir a cada mujer y cada familia.
          </p>
          <p className="about-hero-body">
            Lo integre al home para que mantenga la misma dinamica visual de las otras secciones y
            no se sienta como una pagina aparte. Despues podemos reemplazar este texto por tu
            historia real, experiencia y propuesta de valor.
          </p>
        </div>

        <div className="about-hero-stage" aria-hidden>
          <div className="about-hero-circle" />
        </div>
      </section>

      <section id="servicios" className="services-showcase clean-scroll-section" data-section-id="servicios">
        <div className="services-showcase-layout">
          <div className="services-story">
            <span className="clean-eyebrow">Servicios</span>
            <h2>Acompanamiento en cada etapa</h2>
            <p className="services-story-focus">{activeService?.title}</p>
            <p className="services-story-body">{activeService?.description}</p>

            <div className="services-story-meta">
              <strong>
                {String(safeActiveServiceIndex + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
              </strong>
              <span>Mock visual con 10 servicios ficticios. Algunos abren un carrusel de imagenes al hacer click.</span>
            </div>

            <div className="services-story-controls">
              <button
                type="button"
                className="services-nav-button"
                onClick={() => handleServicePageChange(-1)}
                aria-label="Servicios anteriores"
              >
                Anterior
              </button>
              <button
                type="button"
                className="services-nav-button"
                onClick={() => handleServicePageChange(1)}
                aria-label="Servicios siguientes"
              >
                Siguiente
              </button>
              {activeService?.gallery?.length ? (
                <button
                  type="button"
                  className="services-nav-button services-gallery-button"
                  onClick={() => openServiceGallery(safeActiveServiceIndex, 0)}
                >
                  Ver carrusel
                </button>
              ) : null}
            </div>

            {totalServicePages > 1 ? (
              <div className="services-page-dots" aria-label="Paginas de servicios">
                {Array.from({ length: totalServicePages }, (_, pageIndex) => (
                  <button
                    key={`services-page-${pageIndex}`}
                    type="button"
                    className={pageIndex === activeServicePage ? 'services-page-dot active' : 'services-page-dot'}
                    onClick={() => setActiveServiceIndex(pageIndex * servicesPerPage)}
                    aria-label={`Ir a la pagina ${pageIndex + 1} de servicios`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="services-diagram" aria-label="Lista interactiva de servicios">
            {visibleServices.map((service, localIndex) => {
              const absoluteIndex = servicePageStart + localIndex;

              return (
                <button
                  key={service.id}
                  type="button"
                  className={
                    absoluteIndex === safeActiveServiceIndex
                      ? `service-node service-node-${localIndex + 1} active`
                      : `service-node service-node-${localIndex + 1}`
                  }
                  onClick={() => handleServiceCardClick(absoluteIndex)}
                >
                  <span className="service-node-badge">{String(absoluteIndex + 1).padStart(2, '0')}</span>
                  {service.gallery?.length ? <span className="service-node-flag">Galeria</span> : null}

                  <div className="service-node-media" aria-hidden>
                    {service.imageUrl ? <img src={service.imageUrl} alt="" /> : <span>{String(absoluteIndex + 1).padStart(2, '0')}</span>}
                  </div>

                  <div className="service-node-copy">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {galleryState && openGalleryService ? (
        <div className="services-gallery-modal" role="dialog" aria-modal="true" aria-label="Galeria del servicio">
          <div className="services-gallery-backdrop" onClick={closeServiceGallery} />

          <div className="services-gallery-shell">
            <button
              type="button"
              className="services-gallery-close"
              onClick={closeServiceGallery}
              aria-label="Cerrar galeria"
            >
              Cerrar
            </button>

            <div className="services-gallery-main">
              <button
                type="button"
                className="services-gallery-arrow"
                onClick={() => moveGallery(-1)}
                aria-label="Imagen anterior"
              >
                Prev
              </button>

              <div className="services-gallery-frame">
                <img
                  src={activeGalleryImage}
                  alt={`${openGalleryService.title} imagen ${galleryState.slideIndex + 1}`}
                />
              </div>

              <button
                type="button"
                className="services-gallery-arrow"
                onClick={() => moveGallery(1)}
                aria-label="Imagen siguiente"
              >
                Next
              </button>
            </div>

            <div className="services-gallery-footer">
              <div>
                <span className="clean-eyebrow">Galeria</span>
                <h3>{openGalleryService.title}</h3>
              </div>

              <div className="services-gallery-dots">
                {openGalleryService.gallery.map((_image, index) => (
                  <button
                    key={`${openGalleryService.id}-gallery-${index}`}
                    type="button"
                    className={index === galleryState.slideIndex ? 'services-gallery-dot active' : 'services-gallery-dot'}
                    onClick={() => setGalleryState((prev) => ({ ...prev, slideIndex: index }))}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section id="comentarios" className="comments-showcase clean-scroll-section" data-section-id="comentarios">
        <div className="comments-showcase-header">
          <span className="clean-eyebrow">Comentarios</span>
          <h2>Testimonios</h2>
          <div className="comments-showcase-line" aria-hidden />
        </div>

        <div className="comments-carousel" aria-label="Testimonios de pacientes">
          <div className="comments-carousel-stage">
            {mockTestimonials.map((testimonial, index) => {
              const offset = getCardOffset(index);
              const distance = Math.abs(offset);
              const positionClass =
                distance === 0 ? 'is-active' : distance === 1 ? 'is-side' : 'is-hidden';

              return (
                <article
                  key={testimonial.id}
                  className={`testimonial-card ${positionClass} ${offset < 0 ? 'is-left' : ''} ${
                    offset > 0 ? 'is-right' : ''
                  }`}
                  style={{
                    '--offset': offset,
                    zIndex: 20 - distance
                  }}
                >
                  <div className="testimonial-rating" aria-hidden>
                    {Array.from({ length: 5 }, (_, starIndex) => (
                      <span
                        key={`${testimonial.id}-star-${starIndex}`}
                        className={starIndex < testimonial.rating ? 'star filled' : 'star'}
                      >
                        {'\u2605'}
                      </span>
                    ))}
                  </div>

                  <div className="testimonial-avatar" aria-hidden>
                    <span className="testimonial-avatar-circle" />
                  </div>

                  <div className="testimonial-content">
                    <p className="testimonial-name">{testimonial.name}</p>
                    <p className="testimonial-handle">{testimonial.handle}</p>
                    <p className="testimonial-quote">{testimonial.quote}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="comments-carousel-dots" aria-label="Cambiar testimonio">
            {mockTestimonials.map((testimonial, index) => (
              <button
                key={`${testimonial.id}-dot`}
                type="button"
                className={index === activeTestimonial ? 'comments-dot active' : 'comments-dot'}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`Mostrar testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {placeholderSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="clean-placeholder-section clean-scroll-section"
          data-section-id={section.id}
        >
          <div className="clean-placeholder-copy">
            <h2>{section.label}</h2>
          </div>
        </section>
      ))}

      {notice ? <p className="clean-notice">{notice}</p> : null}
    </main>
  );
}
