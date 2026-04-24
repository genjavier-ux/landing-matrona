import {
  DataTable,
  EmptyState,
  Panel,
  SelectField
} from '../ui';

const filterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'rejected', label: 'Rechazados' }
];

export default function TestimonialsModerationTable({
  testimonials,
  filterValue,
  busyAction,
  formatDate,
  onFilterChange,
  onApprove,
  onDelete
}) {
  const columns = [
    {
      id: 'patientNameAlias',
      label: 'Paciente',
      render: (testimonial) => <strong>{testimonial.patientNameAlias}</strong>
    },
    {
      id: 'status',
      label: 'Estado',
      render: (testimonial) => (
        <span className={`status-pill ${testimonial.status}`}>{testimonial.status}</span>
      )
    },
    {
      id: 'content',
      label: 'Comentario'
    },
    {
      id: 'createdAt',
      label: 'Fecha',
      render: (testimonial) => formatDate(testimonial.createdAt)
    },
    {
      id: 'actions',
      label: 'Acciones',
      render: (testimonial) => (
        <div className="ui-table-actions">
          {testimonial.status !== 'approved' ? (
            <button
              type="button"
              onClick={() => onApprove(testimonial.id)}
              disabled={busyAction === `approve-${testimonial.id}`}
            >
              {busyAction === `approve-${testimonial.id}` ? 'Aprobando...' : 'Aprobar'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(testimonial.id)}
            disabled={busyAction === `delete-${testimonial.id}`}
          >
            {busyAction === `delete-${testimonial.id}` ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      )
    }
  ];

  return (
    <Panel className="admin-card">
      <div className="admin-section-head admin-table-head">
        <div>
          <span className="section-kicker">Comentarios</span>
          <h2>Moderacion</h2>
        </div>

        <SelectField
          label="Filtrar estado"
          value={filterValue}
          options={filterOptions}
          onChange={(event) => onFilterChange(event.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={testimonials}
        getRowKey={(testimonial) => testimonial.id}
        emptyState={
          <EmptyState
            title="No hay comentarios para este filtro"
            description="Prueba otro estado o espera nuevas respuestas para moderar."
          />
        }
      />
    </Panel>
  );
}
