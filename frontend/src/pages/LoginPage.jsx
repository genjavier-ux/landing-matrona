import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [status, setStatus] = useState({
    type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem('matrona-token')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((currentValue) => ({
      ...currentValue,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({
      type: '',
      message: ''
    });

    try {
      const response = await login(credentials);
      window.localStorage.setItem('matrona-token', response.token);
      navigate('/admin', { replace: true });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'No fue posible iniciar sesion.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-page">
      <div className="form-layout form-layout-login">
        <div className="form-intro">
          <span className="section-tag">Login</span>
          <h1>Acceso al panel</h1>
          <p>El boton del menu ya dirige a este acceso y autentica contra el backend existente.</p>

          <div className="list-card form-note">
            <strong>Integracion lista</strong>
            <p>Al iniciar sesion se guarda el token y se carga el dashboard administrativo.</p>
          </div>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Usuario o correo</span>
            <input
              type="text"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="admin"
              required
            />
          </label>

          <label className="field">
            <span>Contrasena</span>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Tu contrasena"
              required
            />
          </label>

          {status.message ? <p className={`form-status ${status.type}`}>{status.message}</p> : null}

          <button type="submit" className="button button-primary submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </section>
  );
}
