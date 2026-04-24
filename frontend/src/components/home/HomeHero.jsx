import { SectionShell } from '../ui';

export default function HomeHero({ content, onShowServices, onShowAbout }) {
  return (
    <SectionShell
      id="inicio"
      className="clean-hero clean-scroll-section visible"
      data-section-id="inicio"
    >
      <div className="clean-hero-copy">
        <span className="clean-eyebrow">{content.hero.title}</span>
        <h1>ACOMPANAMIENTO CERCANO</h1>
        <p className="clean-hero-description">{content.hero.description}</p>

        <div className="clean-hero-actions">
          <button type="button" className="clean-primary-button" onClick={onShowServices}>
            Ver servicios
          </button>
          <button type="button" className="clean-secondary-link" onClick={onShowAbout}>
            Ver sobre mi
          </button>
        </div>
      </div>

      <div className="clean-hero-art">
        <div className="clean-hero-circle" />
        <div className="clean-hero-portrait-shell">
          <img className="clean-hero-portrait" src="/hero-matrona.png" alt="Matrona sonriendo" />
        </div>
      </div>
    </SectionShell>
  );
}
