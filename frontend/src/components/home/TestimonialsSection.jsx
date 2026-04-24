import { DotPagination, SectionShell } from '../ui';

export default function TestimonialsSection({
  testimonials,
  activeTestimonial,
  getCardOffset,
  onSelect
}) {
  return (
    <SectionShell
      id="comentarios"
      className="comments-showcase clean-scroll-section"
      data-section-id="comentarios"
    >
      <div className="comments-showcase-header">
        <span className="clean-eyebrow">Comentarios</span>
        <h2>Testimonios</h2>
        <div className="comments-showcase-line" aria-hidden />
      </div>

      <div className="comments-carousel" aria-label="Testimonios de pacientes">
        <div className="comments-carousel-stage">
          {testimonials.map((testimonial, index) => {
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

        <DotPagination
          count={testimonials.length}
          activeIndex={activeTestimonial}
          onSelect={onSelect}
          className="comments-carousel-dots"
          dotClassName="comments-dot"
          getAriaLabel={(index) => `Mostrar testimonio ${index + 1}`}
        />
      </div>
    </SectionShell>
  );
}
