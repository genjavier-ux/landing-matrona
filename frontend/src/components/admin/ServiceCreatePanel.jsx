import { FieldInput, FieldTextarea, Panel } from '../ui';

export default function ServiceCreatePanel({ form, busyAction, onSubmit, onChange }) {
  return (
    <Panel className="admin-card admin-create-service">
      <span className="section-kicker">Nuevo servicio</span>
      <p className="section-lead">
        La landing ya no depende de 1 o 3 servicios fijos. Desde aqui puede crear todos los que
        necesite.
      </p>

      <form onSubmit={onSubmit} className="stack-form">
        <FieldInput
          required
          label="Titulo del servicio"
          placeholder="Titulo del servicio"
          value={form.title}
          onChange={(event) => onChange('title', event.target.value)}
        />
        <FieldTextarea
          required
          label="Descripcion del servicio"
          placeholder="Descripcion del servicio"
          value={form.description}
          onChange={(event) => onChange('description', event.target.value)}
        />
        <FieldInput
          label="URL de imagen"
          placeholder="URL de imagen"
          value={form.imageUrl}
          onChange={(event) => onChange('imageUrl', event.target.value)}
        />
        <button type="submit" disabled={busyAction === 'create-service'}>
          {busyAction === 'create-service' ? 'Creando...' : 'Agregar servicio'}
        </button>
      </form>
    </Panel>
  );
}
