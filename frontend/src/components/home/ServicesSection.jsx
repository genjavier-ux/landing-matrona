import { DotPagination, SectionShell } from '../ui';

export default function ServicesSection({
  services,
  activeService,
  activeServiceIndex,
  activeServicePage,
  totalServicePages,
  visibleServices,
  servicePageStart,
  onPrevPage,
  onNextPage,
  onSelectPage,
  onSelectService,
  onOpenGallery
}) {
  return (
    <SectionShell
      id="servicios"
      className="services-showcase clean-scroll-section"
      data-section-id="servicios"
    >
      <div className="services-showcase-layout">
        <div className="services-story">
          <span className="clean-eyebrow">Servicios</span>
          <h2>Acompanamiento en cada etapa</h2>
          <p className="services-story-focus">{activeService?.title}</p>
          <p className="services-story-body">{activeService?.description}</p>

          <div className="services-story-meta">
            <strong>
              {String(activeServiceIndex + 1).padStart(2, '0')} /{' '}
              {String(services.length).padStart(2, '0')}
            </strong>
            <span>Mock visual con 10 servicios ficticios. Algunos abren un carrusel al hacer click.</span>
          </div>

          <div className="services-story-controls">
            <button
              type="button"
              className="services-nav-button"
              onClick={onPrevPage}
              aria-label="Servicios anteriores"
            >
              Anterior
            </button>
            <button
              type="button"
              className="services-nav-button"
              onClick={onNextPage}
              aria-label="Servicios siguientes"
            >
              Siguiente
            </button>
            {activeService?.gallery?.length ? (
              <button
                type="button"
                className="services-nav-button services-gallery-button"
                onClick={onOpenGallery}
              >
                Ver carrusel
              </button>
            ) : null}
          </div>

          <DotPagination
            count={totalServicePages}
            activeIndex={activeServicePage}
            onSelect={onSelectPage}
            className="services-page-dots"
            dotClassName="services-page-dot"
            getAriaLabel={(pageIndex) => `Ir a la pagina ${pageIndex + 1} de servicios`}
          />
        </div>

        <div className="services-diagram" aria-label="Lista interactiva de servicios">
          {visibleServices.map((service, localIndex) => {
            const absoluteIndex = servicePageStart + localIndex;
            const isActive = absoluteIndex === activeServiceIndex;

            return (
              <button
                key={service.id}
                type="button"
                className={
                  isActive
                    ? `service-node service-node-${localIndex + 1} active`
                    : `service-node service-node-${localIndex + 1}`
                }
                onClick={() => onSelectService(absoluteIndex)}
              >
                <span className="service-node-badge">{String(absoluteIndex + 1).padStart(2, '0')}</span>
                {service.gallery?.length ? <span className="service-node-flag">Galeria</span> : null}

                <div className="service-node-media" aria-hidden>
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt="" />
                  ) : (
                    <span>{String(absoluteIndex + 1).padStart(2, '0')}</span>
                  )}
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
    </SectionShell>
  );
}
