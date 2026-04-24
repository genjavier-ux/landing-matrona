import {
  EmptyState,
  FieldInput,
  FieldTextarea,
  GridShell,
  Panel
} from '../ui';

export default function ServiceEditorGrid({
  services,
  busyAction,
  onChange,
  onSubmit,
  onDelete
}) {
  if (!services.length) {
    return (
      <EmptyState
        title="Todavia no hay servicios"
        description="Crea el primero desde el panel superior y aparecera en esta grilla editable."
      />
    );
  }

  return (
    <GridShell className="admin-service-grid">
      {services.map((service) => (
        <form key={service.id} onSubmit={(event) => onSubmit(event, service.id)}>
          <Panel className="admin-card stack-form">
            <strong className="admin-card-id">Servicio #{service.id}</strong>
            <FieldInput
              required
              label="Titulo"
              placeholder="Titulo"
              value={service.title}
              onChange={(event) => onChange(service.id, 'title', event.target.value)}
            />
            <FieldTextarea
              required
              label="Descripcion"
              placeholder="Descripcion"
              value={service.description}
              onChange={(event) => onChange(service.id, 'description', event.target.value)}
            />
            <FieldInput
              label="URL imagen"
              placeholder="URL imagen"
              value={service.imageUrl}
              onChange={(event) => onChange(service.id, 'imageUrl', event.target.value)}
            />
            <div className="admin-actions-row">
              <button type="submit" disabled={busyAction === `service-${service.id}`}>
                {busyAction === `service-${service.id}` ? 'Guardando...' : 'Guardar servicio'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(service.id)}
                disabled={busyAction === `delete-service-${service.id}`}
              >
                {busyAction === `delete-service-${service.id}` ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </Panel>
        </form>
      ))}
    </GridShell>
  );
}
