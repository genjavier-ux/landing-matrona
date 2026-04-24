import { FieldInput, NoticeBanner, Panel } from '../ui';

export default function AdminLoginPanel({
  credentials,
  isLoggingIn,
  message,
  onSubmit,
  onCredentialsChange
}) {
  return (
    <main className="layout admin-shell">
      <Panel className="admin-auth-card">
        <span className="section-kicker">Acceso admin</span>
        <h1>Inicia sesion para ver las pantallas editables</h1>
        <p className="section-lead">
          Al entrar veras el panel para editar hero, servicios, comentarios y codigos.
        </p>

        <form onSubmit={onSubmit} className="stack-form">
          <FieldInput
            required
            type="text"
            label="Correo"
            placeholder="admin@matrona.cl"
            value={credentials.email}
            onChange={(event) => onCredentialsChange('email', event.target.value)}
          />
          <FieldInput
            required
            type="password"
            label="Contrasena"
            placeholder="Contrasena"
            value={credentials.password}
            onChange={(event) => onCredentialsChange('password', event.target.value)}
          />
          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? 'Ingresando...' : 'Iniciar sesion'}
          </button>
        </form>

        {message ? <NoticeBanner>{message}</NoticeBanner> : null}
      </Panel>
    </main>
  );
}
