import { useRef, useState } from 'react';
import usePublicContent from '../hooks/usePublicContent';

const fallbackTestimonials = [
  {
    id: 1,
    patientNameAlias: 'Valentina R.',
    content:
      'Me senti acompanada en todo momento. La reserva fue simple y la atencion muy cercana.',
    rating: 5
  },
  {
    id: 2,
    patientNameAlias: 'Camila S.',
    content:
      'Todo fue claro desde la primera consulta. Me dio mucha tranquilidad resolver dudas importantes.',
    rating: 5
  },
  {
    id: 3,
    patientNameAlias: 'Daniela M.',
    content:
      'Me gusto mucho la calidez de la atencion y la forma tan humana de explicar cada paso.',
    rating: 5
  },
  {
    id: 4,
    patientNameAlias: 'Fernanda P.',
    content:
      'La agenda online fue rapida y despues la experiencia presencial fue ordenada y muy amable.',
    rating: 4
  },
  {
    id: 5,
    patientNameAlias: 'Javiera A.',
    content:
      'Senti mucha confianza durante el seguimiento. Todo se vio prolijo, claro y profesional.',
    rating: 5
  },
  {
    id: 6,
    patientNameAlias: 'Constanza G.',
    content:
      'Muy buena experiencia. Los horarios estaban claros y la atencion fue delicada y atenta.',
    rating: 4
  }
];

const getWrappedIndex = (length, index) => {
  if (!length) {
    return 0;
  }

  return ((index % length) + length) % length;
};

const getInitials = (alias) =>
  alias
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || '')
    .join('');

const getHandle = (alias) => `@${alias.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;

function TestimonialCard({ testimonial, variant, onClick }) {
  const Component = onClick ? 'button' : 'article';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      className={`testimonial-panel ${variant} ${onClick ? 'is-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="testimonial-card-surface">
        <div className="testimonial-copy">
          <span className="testimonial-quote" aria-hidden="true">
            "
          </span>
          <p>{testimonial.content}</p>
        </div>

        <div className="testimonial-meta">
          <div className="testimonial-stars" aria-label={`${testimonial.rating} de 5 estrellas`}>
            {Array.from({ length: 5 }, (_, starIndex) => (
              <span
                key={`${testimonial.id ?? testimonial.patientNameAlias}-star-${starIndex}`}
                className={`testimonial-star ${starIndex < testimonial.rating ? 'is-filled' : ''}`}
                aria-hidden="true"
              >
                &#9733;
              </span>
            ))}
          </div>

          <span className="testimonial-divider" aria-hidden="true" />

          <div className="testimonial-identity">
            <span className="testimonial-avatar" aria-hidden="true">
              {getInitials(testimonial.patientNameAlias)}
            </span>

            <div>
              <strong>{testimonial.patientNameAlias}</strong>
              <span>{getHandle(testimonial.patientNameAlias)}</span>
            </div>
          </div>
        </div>
      </div>
    </Component>
  );
}

export default function CommentsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelLockRef = useRef(false);
  const { content, statusMessage } = usePublicContent();

  const activeTestimonials = content.testimonials?.length ? content.testimonials : fallbackTestimonials;
  const length = activeTestimonials.length;
  const commentsSection = content.sections.comments;

  const goToPrevious = () => {
    setActiveIndex((currentIndex) => getWrappedIndex(length, currentIndex - 1));
  };

  const goToNext = () => {
    setActiveIndex((currentIndex) => getWrappedIndex(length, currentIndex + 1));
  };

  const handleWheel = (event) => {
    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (Math.abs(dominantDelta) < 18 || wheelLockRef.current) {
      return;
    }

    wheelLockRef.current = true;
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 420);

    if (dominantDelta > 0) {
      goToNext();
      return;
    }

    goToPrevious();
  };

  const centerTestimonial = activeTestimonials[getWrappedIndex(length, activeIndex)];
  const leftTestimonial = activeTestimonials[getWrappedIndex(length, activeIndex - 1)];
  const rightTestimonial = activeTestimonials[getWrappedIndex(length, activeIndex + 1)];

  return (
    <section className="comments-page">
      <div className="comments-header">
        <span className="section-tag">Comentarios</span>
        <h1>{commentsSection.title}</h1>
        <span className="comments-accent" />
        <p className="comments-header-copy">{commentsSection.content}</p>
        {statusMessage ? <p className="status-note">{statusMessage}</p> : null}
      </div>

      <div className="comments-stage" onWheel={handleWheel}>
        <div className="testimonial-toolbar">
          <button
            type="button"
            className="testimonial-nav-button"
            aria-label="Ver comentario anterior"
            onClick={goToPrevious}
          >
            &#8249;
          </button>

          <div className="testimonial-progress" aria-label="Lista de comentarios">
            {activeTestimonials.map((testimonial, index) => (
              <button
                key={testimonial.id ?? `${testimonial.patientNameAlias}-${index}`}
                type="button"
                className={`testimonial-progress-dot ${index === activeIndex ? 'is-active' : ''}`}
                aria-label={`Ver comentario de ${testimonial.patientNameAlias}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>

          <button
            type="button"
            className="testimonial-nav-button"
            aria-label="Ver comentario siguiente"
            onClick={goToNext}
          >
            &#8250;
          </button>
        </div>

        <div className="testimonial-showcase" aria-label="Comentarios de pacientes">
          <TestimonialCard
            testimonial={leftTestimonial}
            variant="is-side"
            onClick={() => setActiveIndex(getWrappedIndex(length, activeIndex - 1))}
          />
          <TestimonialCard testimonial={centerTestimonial} variant="is-center" />
          <TestimonialCard
            testimonial={rightTestimonial}
            variant="is-side"
            onClick={() => setActiveIndex(getWrappedIndex(length, activeIndex + 1))}
          />
        </div>
      </div>
    </section>
  );
}
