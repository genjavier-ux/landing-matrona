import { PageSkeleton, Panel, SkeletonBlock } from '../ui';

export default function AdminLoadingPanel() {
  return (
    <PageSkeleton as="main" className="layout admin-shell">
      <Panel className="admin-card">
        <span className="section-kicker">Panel admin</span>
        <h1>Cargando pantallas editables...</h1>
        <p className="section-lead">Estamos preparando el contenido para editar.</p>
        <div className="ui-admin-skeleton-stack">
          <SkeletonBlock className="ui-admin-skeleton ui-admin-skeleton-title" />
          <SkeletonBlock className="ui-admin-skeleton ui-admin-skeleton-row" />
          <SkeletonBlock className="ui-admin-skeleton ui-admin-skeleton-row" />
        </div>
      </Panel>
    </PageSkeleton>
  );
}
