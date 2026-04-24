import { SectionShell } from '../ui';

export default function AboutSection() {
  return (
    <SectionShell
      id="sobre-mi"
      className="about-hero clean-scroll-section"
      data-section-id="sobre-mi"
    >
      <div className="about-hero-copy">
        <span className="clean-eyebrow">Sobre mi</span>
        <h1>UNA PRESENCIA CERCANA Y PROFESIONAL</h1>
        <p className="about-hero-lead">
          Este bloque presenta quien eres, como acompanas y el tono humano con el que quieres
          recibir a cada mujer y cada familia.
        </p>
        <p className="about-hero-body">
          Lo integre al home para que mantenga la misma dinamica visual de las otras secciones y no
          se sienta como una pagina aparte. Despues podemos reemplazar este texto por tu historia
          real, experiencia y propuesta de valor.
        </p>
      </div>

      <div className="about-hero-stage" aria-hidden>
        <div className="about-hero-circle" />
      </div>
    </SectionShell>
  );
}
