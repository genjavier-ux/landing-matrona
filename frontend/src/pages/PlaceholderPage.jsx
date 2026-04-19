export default function PlaceholderPage({ title }) {
  return (
    <section className="placeholder-section">
      <div className="placeholder-card">
        <span className="section-tag">Seccion</span>
        <h1>{title}</h1>
      </div>
    </section>
  );
}
