<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { fetchPublicContent } from '../services/api';
import {
  AboutSection,
  fallbackContent,
  HomeHeader,
  HomeHero,
  HomeSkeleton,
  mockServices,
  mockTestimonials,
  navItems,
  PlaceholderSections,
  placeholderSections,
  ServiceGalleryModal,
  ServicesSection,
  servicesPerPage,
  TestimonialsSection
} from '../components/home';
import { NoticeBanner } from '../components/ui';
=======
import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePublicContent from '../hooks/usePublicContent';

const HERO_ROTATION_KEY = 'matrona-home-hero-rotation';

const defaultHeroVisuals = [
  {
    id: 'default-hero-visual',
    title: 'Laguna Salud',
    description: 'Cuidado cercano, agenda simple y una experiencia visual limpia.',
    imageUrl: '/hero-matrona.png'
  }
];

const heroVariants = [
  {
    id: 'orbital',
    label: 'Circular',
    note: 'Composicion suave con atmosfera limpia y abierta.'
  },
  {
    id: 'blob',
    label: 'Organica',
    note: 'Volumen amplio, bordes fluidos y una lectura minimalista.'
  },
  {
    id: 'prism',
    label: 'Triangular',
    note: 'Recorte dinamico con acentos geometricos y mucho aire.'
  },
  {
    id: 'frame',
    label: 'Marco',
    note: 'Capas suaves, profundidad ligera y protagonismo para la foto.'
  }
];

const sectionLinks = [
  { to: '/sobre-mi', label: 'Sobre mi' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/comentarios', label: 'Comentarios' },
  { to: '/contacto', label: 'Contacto' }
];

const getNextHeroSeed = () => {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    const storedValue = Number(window.sessionStorage.getItem(HERO_ROTATION_KEY) || '-1');
    const nextValue = Number.isFinite(storedValue) ? storedValue + 1 : 0;
    window.sessionStorage.setItem(HERO_ROTATION_KEY, String(nextValue));
    return nextValue;
  } catch (_error) {
    return 0;
  }
};
>>>>>>> 6096c9d95a01662a7c8dc7de58cb46e7ce8b34e7

export default function HomePage() {
  const { content, statusMessage } = usePublicContent();
  const [heroSeed] = useState(getNextHeroSeed);
  const availableHeroVisuals = (content.gallery || []).filter((item) => item.imageUrl);
  const heroVisuals = availableHeroVisuals.length ? availableHeroVisuals : defaultHeroVisuals;
  const activeVariantIndex = heroSeed % heroVariants.length;
  const activeVisualIndex = heroVisuals.length
    ? (heroSeed * 2 + activeVariantIndex) % heroVisuals.length
    : 0;
  const activeVariant = heroVariants[activeVariantIndex];
  const activeVisual = heroVisuals[activeVisualIndex] || defaultHeroVisuals[0];

  return (
<<<<<<< HEAD
    <main className="clean-home">
      <HomeHeader navItems={navItems} activeSection={activeSection} onSelect={handleNavClick} />

      <HomeHero
        content={content}
        onShowServices={() => handleNavClick('servicios')}
        onShowAbout={() => handleNavClick('sobre-mi')}
      />

      <AboutSection />

      <ServicesSection
        services={services}
        activeService={activeService}
        activeServiceIndex={safeActiveServiceIndex}
        activeServicePage={activeServicePage}
        totalServicePages={totalServicePages}
        visibleServices={visibleServices}
        servicePageStart={servicePageStart}
        onPrevPage={() => handleServicePageChange(-1)}
        onNextPage={() => handleServicePageChange(1)}
        onSelectPage={(pageIndex) => setActiveServiceIndex(pageIndex * servicesPerPage)}
        onSelectService={handleServiceCardClick}
        onOpenGallery={() => openServiceGallery(safeActiveServiceIndex, 0)}
      />

      <ServiceGalleryModal
        openGalleryService={openGalleryService}
        galleryState={galleryState}
        activeGalleryImage={activeGalleryImage}
        onClose={closeServiceGallery}
        onPrev={() => moveGallery(-1)}
        onNext={() => moveGallery(1)}
        onSelectImage={(index) => setGalleryState((prev) => ({ ...prev, slideIndex: index }))}
      />

      <TestimonialsSection
        testimonials={mockTestimonials}
        activeTestimonial={activeTestimonial}
        getCardOffset={getCardOffset}
        onSelect={setActiveTestimonial}
      />

      <PlaceholderSections sections={placeholderSections} />

      {notice ? <NoticeBanner className="clean-notice">{notice}</NoticeBanner> : null}
    </main>
=======
    <div className="home-page">
      <section className={`hero-section hero-section-${activeVariant.id} section-shell`}>
        <div className="hero-backdrop" aria-hidden="true">
          <span className="hero-backdrop-orb hero-backdrop-orb-a" />
          <span className="hero-backdrop-orb hero-backdrop-orb-b" />
          <span className="hero-backdrop-orb hero-backdrop-orb-c" />
        </div>

        <div className="hero-copy">
          <span className="section-tag">Laguna Salud</span>

          <div className="hero-pills">
            <span className="hero-pill">Hero rotativo</span>
            <span className="hero-pill is-subtle">{activeVariant.label}</span>
            {heroVisuals.length > 1 ? (
              <span className="hero-pill is-subtle">
                {activeVisualIndex + 1}/{heroVisuals.length} visuales
              </span>
            ) : null}
          </div>

          <h1>{content.hero.title}</h1>
          <p>{content.hero.description}</p>

          <div className="hero-actions">
            <Link to="/reservar-hora" className="button button-primary">
              Reservar hora
            </Link>
            <Link to="/servicios" className="button button-secondary">
              Ver servicios
            </Link>
          </div>

          {statusMessage ? <p className="status-note">{statusMessage}</p> : null}
        </div>

        <div className="hero-visual">
          <div className="hero-composition">
            <div className="hero-shape hero-shape-primary" />
            <div className="hero-shape hero-shape-secondary" />

            <div className={`hero-photo-shell hero-photo-shell-${activeVariant.id}`}>
              <div className="hero-photo-accent hero-photo-accent-a" />
              <div className="hero-photo-accent hero-photo-accent-b" />

              <div className="hero-photo-mask">
                <img
                  src={activeVisual.imageUrl}
                  alt={activeVisual.title || 'Profesional de la salud'}
                  className="hero-image"
                />
              </div>
            </div>

            <div className="hero-note hero-note-top">
              <span>Visual activo</span>
              <strong>{activeVisual.title || 'Presentacion principal'}</strong>
            </div>

            <div className="hero-note hero-note-bottom">
              <span>{activeVisual.description || activeVariant.note}</span>
            </div>
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
>>>>>>> 6096c9d95a01662a7c8dc7de58cb46e7ce8b34e7
  );
}
