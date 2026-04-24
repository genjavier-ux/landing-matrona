import { FieldInput, FieldTextarea, Panel } from '../ui';

export default function HeroEditorPanel({ heroForm, busyAction, onSubmit, onChange }) {
  return (
    <Panel className="admin-card">
      <span className="section-kicker">Hero editable</span>
      <h2>Editar portada principal</h2>
      <form onSubmit={onSubmit} className="stack-form">
        <FieldInput
          required
          label="Titulo principal"
          placeholder="Titulo principal"
          value={heroForm.title}
          onChange={(event) => onChange('title', event.target.value)}
        />
        <FieldTextarea
          required
          label="Texto de apoyo"
          placeholder="Texto de apoyo"
          value={heroForm.content}
          onChange={(event) => onChange('content', event.target.value)}
        />
        <button type="submit" disabled={busyAction === 'hero'}>
          {busyAction === 'hero' ? 'Guardando...' : 'Guardar hero'}
        </button>
      </form>
    </Panel>
  );
}
