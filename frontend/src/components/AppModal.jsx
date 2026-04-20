import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AppModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'large'
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="app-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`app-modal-panel app-modal-panel-${size}`} role="dialog" aria-modal="true">
        <div className="app-modal-orb app-modal-orb-primary" aria-hidden="true" />
        <div className="app-modal-orb app-modal-orb-secondary" aria-hidden="true" />

        <div className="app-modal-header">
          <div>
            <span className="section-tag">Panel</span>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          <button
            type="button"
            className="app-modal-close"
            aria-label="Cerrar modal"
            onClick={onClose}
          >
            &#10005;
          </button>
        </div>

        <div className="app-modal-body">{children}</div>

        {footer ? <div className="app-modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
