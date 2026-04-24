import {
  CalendarField,
  DataTable,
  EmptyState,
  FieldInput,
  Panel
} from '../ui';

export default function ReviewCodesPanel({
  codeForm,
  reviewCodes,
  busyAction,
  formatDate,
  onSubmit,
  onChange
}) {
  const columns = [
    {
      id: 'code',
      label: 'Codigo',
      render: (reviewCode) => <strong>{reviewCode.code}</strong>
    },
    {
      id: 'expiresAt',
      label: 'Expira',
      render: (reviewCode) => formatDate(reviewCode.expiresAt)
    },
    {
      id: 'status',
      label: 'Estado',
      render: (reviewCode) => (
        <span className={reviewCode.isUsed ? 'status-pill used' : 'status-pill'}>
          {reviewCode.isUsed ? 'Usado' : 'Disponible'}
        </span>
      )
    }
  ];

  return (
    <Panel className="admin-card">
      <span className="section-kicker">Codigos</span>
      <h2>Crear codigo para comentarios</h2>
      <form onSubmit={onSubmit} className="stack-form">
        <FieldInput
          required
          label="Codigo unico"
          placeholder="Codigo unico"
          value={codeForm.code}
          onChange={(event) => onChange('code', event.target.value)}
        />
        <CalendarField
          label="Expiracion"
          value={codeForm.expiresAt}
          onChange={(event) => onChange('expiresAt', event.target.value)}
        />
        <button type="submit" disabled={busyAction === 'review-code'}>
          {busyAction === 'review-code' ? 'Creando...' : 'Crear codigo'}
        </button>
      </form>

      <div className="admin-list">
        <DataTable
          columns={columns}
          rows={reviewCodes}
          getRowKey={(reviewCode) => reviewCode.id}
          emptyState={
            <EmptyState
              title="No hay codigos creados"
              description="Cuando generes uno aparecera aqui para controlar disponibilidad y expiracion."
            />
          }
        />
      </div>
    </Panel>
  );
}
