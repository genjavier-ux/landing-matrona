import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppModal from '../components/AppModal';
import usePublicContent from '../hooks/usePublicContent';

const splitParagraphs = (value) =>
  String(value || '')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

const initialGalleryState = {
  isOpen: false,
  serviceId: null,
  serviceTitle: '',
  images: [],
  activeIndex: 0
};

export default function ServicesPage() {
  const { content, statusMessage } = usePublicContent();
  const [activeImageByService, setActiveImageByService] = useState({});
  const [galleryState, setGalleryState] = useState(initialGalleryState);
  const servicesSection = content.sections.services;
  const paragraphs = splitParagraphs(servicesSection.content);
  const galleryImage = galleryState.images[galleryState.activeIndex] || '';

  const setServiceImageIndex = (serviceId, nextIndex) => {
    setActiveImageByService((currentValue) => ({
      ...currentValue,
      [serviceId]: nextIndex
    }));
  };

  const handleCarouselStep = (serviceId, imagesLength, direction) => {
    if (imagesLength <= 1) {
      return;
    }

    setActiveImageByService((currentValue) => {
      const currentIndex = currentValue[serviceId] || 0;
      const nextIndex = (currentIndex + direction + imagesLength) % imagesLength;

      return {
        ...currentValue,
        [serviceId]: nextIndex
      };
    });
  };

  const handleOpenGallery = (service, images, activeIndex) => {
    if (!images.length) {
      return;
    }

    setGalleryState({
      isOpen: true,
      serviceId: service.id,
      serviceTitle: service.title,
      images,
      activeIndex
    });
  };

  const handleCloseGallery = () => {
    setGalleryState(initialGalleryState);
  };

  const handleGalleryStep = (direction) => {
    setGalleryState((currentValue) => {
      if (currentValue.images.length <= 1) {
        return currentValue;
      }

      const nextIndex =
        (currentValue.activeIndex + direction + currentValue.images.length) %
        currentValue.images.length;

      if (currentValue.serviceId) {
        setServiceImageIndex(currentValue.serviceId, nextIndex);
      }

      return {
        ...currentValue,
        activeIndex: nextIndex
      };
    });
  };

  const handleGallerySelect = (nextIndex) => {
    setGalleryState((currentValue) => {
      if (currentValue.serviceId) {
        setServiceImageIndex(currentValue.serviceId, nextIndex);
      }

      return {
        ...currentValue,
        activeIndex: nextIndex
      };
    });
  };

  return (
    <>
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
          {(content.services || []).map((service) => {
            const images = service.images?.length
              ? service.images
              : service.imageUrl
                ? [service.imageUrl]
                : [];
            const activeImageIndex = activeImageByService[service.id] || 0;
            const activeImage = images[activeImageIndex] || images[0] || '';

            return (
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

                {activeImage ? (
                  <div className="service-public-image-wrap">
                    <button
                      type="button"
                      className="service-public-image-open"
                      aria-label={`Ampliar imagen de ${service.title}`}
                      onClick={() => handleOpenGallery(service, images, activeImageIndex)}
                    >
                      <img src={activeImage} alt={service.title} className="service-public-image" />

                      <span className="service-public-image-hint">
                        {images.length > 1 ? 'Ver galeria' : 'Ampliar imagen'}
                      </span>
                    </button>

                    {images.length > 1 ? (
                      <>
                        <button
                          type="button"
                          className="service-public-carousel-button is-prev"
                          aria-label={`Ver imagen anterior de ${service.title}`}
                          onClick={() => handleCarouselStep(service.id, images.length, -1)}
                        >
                          &#8249;
                        </button>

                        <button
                          type="button"
                          className="service-public-carousel-button is-next"
                          aria-label={`Ver siguiente imagen de ${service.title}`}
                          onClick={() => handleCarouselStep(service.id, images.length, 1)}
                        >
                          &#8250;
                        </button>

                        <div
                          className="service-public-carousel-dots"
                          aria-label="Imagenes del servicio"
                        >
                          {images.map((image, index) => (
                            <button
                              key={`${service.id}-${image}-${index}`}
                              type="button"
                              className={`service-public-carousel-dot ${
                                index === activeImageIndex ? 'is-active' : ''
                              }`}
                              aria-label={`Ver imagen ${index + 1} de ${images.length}`}
                              onClick={() => setServiceImageIndex(service.id, index)}
                            />
                          ))}
                        </div>

                        <span className="service-public-gallery-count">
                          {activeImageIndex + 1} / {images.length}
                        </span>
                      </>
                    ) : null}
                  </div>
                ) : null}

                <div className="service-public-actions">
                  <Link
                    to={`/reservar-hora?service=${service.id}`}
                    className="button button-primary service-public-booking"
                  >
                    Reservar
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <AppModal
        isOpen={galleryState.isOpen}
        onClose={handleCloseGallery}
        kicker="Galeria"
        title={galleryState.serviceTitle || 'Imagen del servicio'}
        subtitle={
          galleryState.images.length
            ? `Imagen ${galleryState.activeIndex + 1} de ${galleryState.images.length}`
            : ''
        }
      >
        <div className="service-gallery-modal">
          {galleryImage ? (
            <div className="service-gallery-stage">
              <img
                src={galleryImage}
                alt={`${galleryState.serviceTitle} ${galleryState.activeIndex + 1}`}
                className="service-gallery-image"
              />

              {galleryState.images.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="service-gallery-button is-prev"
                    aria-label="Ver imagen anterior"
                    onClick={() => handleGalleryStep(-1)}
                  >
                    &#8249;
                  </button>

                  <button
                    type="button"
                    className="service-gallery-button is-next"
                    aria-label="Ver imagen siguiente"
                    onClick={() => handleGalleryStep(1)}
                  >
                    &#8250;
                  </button>
                </>
              ) : null}
            </div>
          ) : null}

          {galleryState.images.length > 1 ? (
            <div className="service-gallery-thumbs" aria-label="Miniaturas de la galeria">
              {galleryState.images.map((image, index) => (
                <button
                  key={`${galleryState.serviceId}-${image}-${index}`}
                  type="button"
                  className={`service-gallery-thumb ${
                    index === galleryState.activeIndex ? 'is-active' : ''
                  }`}
                  aria-label={`Abrir imagen ${index + 1}`}
                  onClick={() => handleGallerySelect(index)}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </AppModal>
    </>
  );
}
