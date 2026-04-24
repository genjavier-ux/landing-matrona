import { Panel, StatPanel } from '../ui';

export default function AdminToolbar({ serviceCount, pendingCount, onLogout }) {
  return (
    <Panel className="admin-toolbar">
      <div>
        <span className="section-kicker">Panel editable</span>
        <h1>Landing Matrona</h1>
        <p className="section-lead">
          Tras el login ya se muestran las pantallas editables con el contenido actual.
        </p>
      </div>

      <div className="admin-toolbar-actions">
        <StatPanel value={serviceCount} label="servicios" />
        <StatPanel value={pendingCount} label="pendientes" />
        <button type="button" onClick={onLogout}>
          Cerrar sesion
        </button>
      </div>
    </Panel>
  );
}
