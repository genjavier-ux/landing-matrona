import { DotPagination } from '../ui';

export default function ServiceGalleryModal({
  openGalleryService,
  galleryState,
  activeGalleryImage,
  onClose,
  onPrev,
  onNext,
  onSelectImage
}) {
  if (!galleryState || !openGalleryService) return null;

  return (
    <div className="services-gallery-modal" role="dialog" aria-modal="true" aria-label="Galeria del servicio">
      <div className="services-gallery-backdrop" onClick={onClose} />

      <div className="services-gallery-shell">
        <button
          type="button"
          className="services-gallery-close"
          onClick={onClose}
          aria-label="Cerrar galeria"
        >
          Cerrar
        </button>

        <div className="services-gallery-main">
          <button
            type="button"
            className="services-gallery-arrow"
            onClick={onPrev}
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
            onClick={onNext}
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

          <DotPagination
            count={openGalleryService.gallery.length}
            activeIndex={galleryState.slideIndex}
            onSelect={onSelectImage}
            className="services-gallery-dots"
            dotClassName="services-gallery-dot"
            getAriaLabel={(index) => `Ver imagen ${index + 1}`}
          />
        </div>
      </div>
    </div>
  );
}
