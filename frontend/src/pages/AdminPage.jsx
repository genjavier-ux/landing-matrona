import { useState } from 'react';
import { login, updateService } from '../services/api';

export default function AdminPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [token, setToken] = useState('');
  const [service, setService] = useState({ title: '', description: '', imageUrl: '' });
  const [message, setMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    const response = await login(credentials);
    setToken(response.token);
    setMessage('Sesión iniciada.');
  };

  const handleServiceUpdate = async (event) => {
    event.preventDefault();
    if (!token) {
      setMessage('Primero inicia sesión.');
      return;
    }
    await updateService(1, service, token);
    setMessage('Servicio actualizado correctamente.');
  };

  return (
    <main className="layout">
      <section className="card">
        <h1>Panel matrona</h1>
        <form onSubmit={handleLogin} className="stack-form">
          <input
            type="email"
            placeholder="admin@matrona.cl"
            value={credentials.email}
            onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={credentials.password}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, password: e.target.value }))
            }
          />
          <button type="submit">Iniciar sesión</button>
        </form>
      </section>

      <section className="card">
        <h2>Editar servicio principal</h2>
        <form onSubmit={handleServiceUpdate} className="stack-form">
          <input
            placeholder="Título"
            value={service.title}
            onChange={(e) => setService((prev) => ({ ...prev, title: e.target.value }))}
          />
          <textarea
            placeholder="Descripción"
            value={service.description}
            onChange={(e) =>
              setService((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <input
            placeholder="URL imagen"
            value={service.imageUrl}
            onChange={(e) => setService((prev) => ({ ...prev, imageUrl: e.target.value }))}
          />
          <button type="submit">Guardar cambios</button>
        </form>
      </section>

      {message && <p className="notice">{message}</p>}
    </main>
  );
}
