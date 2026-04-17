import { useEffect, useState } from 'react';
import {
  approveTestimonial,
  createService,
  createReviewCode,
  deleteService,
  deleteTestimonial,
  fetchAdminDashboard,
  login,
  updateSection,
  updateService
} from '../services/api';

const tokenStorageKey = 'matrona_admin_token';

const initialCredentials = { email: '', password: '' };
const initialHero = { title: '', content: '' };
const initialCodeForm = { code: '', expiresAt: '' };
const initialService = { title: '', description: '', imageUrl: '' };

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function formatDate(value) {
  if (!value) return 'Sin fecha';

  try {
    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminPage() {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey) || '');
  const [dashboard, setDashboard] = useState(null);
  const [heroForm, setHeroForm] = useState(initialHero);
  const [services, setServices] = useState([]);
  const [newServiceForm, setNewServiceForm] = useState(initialService);
  const [codeForm, setCodeForm] = useState(initialCodeForm);
  const [message, setMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(Boolean(token));
  const [busyAction, setBusyAction] = useState('');

  const hydrateDashboard = async (authToken) => {
    setIsLoadingDashboard(true);

    try {
      const data = await fetchAdminDashboard(authToken);
      const heroSection = data.sections.find((section) => section.key === 'hero');

      setDashboard(data);
      setHeroForm({
        title: heroSection?.title || '',
        content: heroSection?.content || ''
      });
      setServices(
        data.services.map((service) => ({
          ...service,
          imageUrl: service.imageUrl || ''
        }))
      );
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem(tokenStorageKey);
        setToken('');
        setDashboard(null);
        setMessage('Tu sesion expiro. Vuelve a iniciar sesion.');
      } else {
        setMessage(getErrorMessage(error, 'No se pudo cargar el panel admin.'));
      }
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setDashboard(null);
      setHeroForm(initialHero);
      setServices([]);
      return;
    }

    hydrateDashboard(token);
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);

    try {
      const response = await login(credentials);
      localStorage.setItem(tokenStorageKey, response.token);
      setToken(response.token);
      setCredentials(initialCredentials);
      setMessage('Sesion iniciada. Ya puedes editar la landing.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo iniciar sesion.'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(tokenStorageKey);
    setToken('');
    setDashboard(null);
    setHeroForm(initialHero);
    setServices([]);
    setNewServiceForm(initialService);
    setCodeForm(initialCodeForm);
    setMessage('Sesion cerrada.');
  };

  const handleHeroUpdate = async (event) => {
    event.preventDefault();
    setBusyAction('hero');

    try {
      await updateSection('hero', heroForm, token);
      setMessage('Hero actualizado correctamente.');
      await hydrateDashboard(token);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo actualizar el hero.'));
    } finally {
      setBusyAction('');
    }
  };

  const handleServiceChange = (serviceId, field, value) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId ? { ...service, [field]: value } : service
      )
    );
  };

  const handleServiceUpdate = async (event, serviceId) => {
    event.preventDefault();
    const service = services.find((item) => item.id === serviceId);
    if (!service) return;

    setBusyAction(`service-${serviceId}`);

    try {
      await updateService(
        serviceId,
        {
          title: service.title,
          description: service.description,
          imageUrl: service.imageUrl
        },
        token
      );
      setMessage(`Servicio ${serviceId} actualizado correctamente.`);
      await hydrateDashboard(token);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo actualizar el servicio.'));
    } finally {
      setBusyAction('');
    }
  };

  const handleCreateService = async (event) => {
    event.preventDefault();
    setBusyAction('create-service');

    try {
      await createService(
        {
          title: newServiceForm.title,
          description: newServiceForm.description,
          imageUrl: newServiceForm.imageUrl
        },
        token
      );
      setNewServiceForm(initialService);
      setMessage('Nuevo servicio creado correctamente.');
      await hydrateDashboard(token);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo crear el servicio.'));
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteService = async (serviceId) => {
    const shouldDelete = window.confirm(
      'Este servicio se eliminara de la landing. ¿Quieres continuar?'
    );

    if (!shouldDelete) return;

    setBusyAction(`delete-service-${serviceId}`);

    try {
      await deleteService(serviceId, token);
      setMessage(`Servicio ${serviceId} eliminado.`);
      await hydrateDashboard(token);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo eliminar el servicio.'));
    } finally {
      setBusyAction('');
    }
  };

  const handleApprove = async (testimonialId) => {
    setBusyAction(`approve-${testimonialId}`);

    try {
      await approveTestimonial(testimonialId, token);
      setMessage('Comentario aprobado.');
      await hydrateDashboard(token);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo aprobar el comentario.'));
    } finally {
      setBusyAction('');
    }
  };

  const handleDelete = async (testimonialId) => {
    setBusyAction(`delete-${testimonialId}`);

    try {
      await deleteTestimonial(testimonialId, token);
      setMessage('Comentario eliminado.');
      await hydrateDashboard(token);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo eliminar el comentario.'));
    } finally {
      setBusyAction('');
    }
  };

  const handleReviewCodeCreate = async (event) => {
    event.preventDefault();
    setBusyAction('review-code');

    try {
      await createReviewCode(
        {
          code: codeForm.code.trim(),
          expiresAt: codeForm.expiresAt || null
        },
        token
      );
      setCodeForm(initialCodeForm);
      setMessage('Codigo creado correctamente.');
      await hydrateDashboard(token);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo crear el codigo.'));
    } finally {
      setBusyAction('');
    }
  };

  if (!token) {
    return (
      <main className="layout admin-shell">
        <section className="card admin-auth-card">
          <span className="section-kicker">Acceso admin</span>
          <h1>Inicia sesion para ver las pantallas editables</h1>
          <p className="section-lead">
            Al entrar veras el panel para editar hero, servicios, comentarios y codigos.
          </p>

          <form onSubmit={handleLogin} className="stack-form">
            <input
              required
              type="text"
              placeholder="admin@matrona.cl"
              value={credentials.email}
              onChange={(event) =>
                setCredentials((prev) => ({ ...prev, email: event.target.value }))
              }
            />
            <input
              required
              type="password"
              placeholder="Contrasena"
              value={credentials.password}
              onChange={(event) =>
                setCredentials((prev) => ({ ...prev, password: event.target.value }))
              }
            />
            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? 'Ingresando...' : 'Iniciar sesion'}
            </button>
          </form>

          {message && <p className="notice">{message}</p>}
        </section>
      </main>
    );
  }

  if (isLoadingDashboard && !dashboard) {
    return (
      <main className="layout admin-shell">
        <section className="card admin-card">
          <span className="section-kicker">Panel admin</span>
          <h1>Cargando pantallas editables...</h1>
          <p className="section-lead">Estamos preparando el contenido para editar.</p>
        </section>
      </main>
    );
  }

  const pendingTestimonials =
    dashboard?.testimonials?.filter((testimonial) => testimonial.status === 'pending') || [];

  return (
    <main className="layout admin-shell">
      <section className="card admin-toolbar">
        <div>
          <span className="section-kicker">Panel editable</span>
          <h1>Landing Matrona</h1>
          <p className="section-lead">
            Tras el login ya se muestran las pantallas editables con el contenido actual.
          </p>
        </div>

        <div className="admin-toolbar-actions">
          <div className="admin-summary">
            <strong>{services.length}</strong>
            <span>servicios</span>
          </div>
          <div className="admin-summary">
            <strong>{pendingTestimonials.length}</strong>
            <span>pendientes</span>
          </div>
          <button type="button" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </section>

      <div className="admin-grid">
        <section className="card admin-card">
          <span className="section-kicker">Hero editable</span>
          <h2>Editar portada principal</h2>
          <form onSubmit={handleHeroUpdate} className="stack-form">
            <input
              required
              placeholder="Titulo principal"
              value={heroForm.title}
              onChange={(event) =>
                setHeroForm((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <textarea
              required
              placeholder="Texto de apoyo"
              value={heroForm.content}
              onChange={(event) =>
                setHeroForm((prev) => ({ ...prev, content: event.target.value }))
              }
            />
            <button type="submit" disabled={busyAction === 'hero'}>
              {busyAction === 'hero' ? 'Guardando...' : 'Guardar hero'}
            </button>
          </form>
        </section>

        <section className="card admin-card">
          <span className="section-kicker">Codigos</span>
          <h2>Crear codigo para comentarios</h2>
          <form onSubmit={handleReviewCodeCreate} className="stack-form">
            <input
              required
              placeholder="Codigo unico"
              value={codeForm.code}
              onChange={(event) =>
                setCodeForm((prev) => ({ ...prev, code: event.target.value }))
              }
            />
            <input
              type="datetime-local"
              value={codeForm.expiresAt}
              onChange={(event) =>
                setCodeForm((prev) => ({ ...prev, expiresAt: event.target.value }))
              }
            />
            <button type="submit" disabled={busyAction === 'review-code'}>
              {busyAction === 'review-code' ? 'Creando...' : 'Crear codigo'}
            </button>
          </form>

          <div className="admin-list">
            {(dashboard?.reviewCodes || []).map((reviewCode) => (
              <article key={reviewCode.id} className="admin-list-item">
                <div>
                  <strong>{reviewCode.code}</strong>
                  <p>{formatDate(reviewCode.expiresAt)}</p>
                </div>
                <span className={reviewCode.isUsed ? 'status-pill used' : 'status-pill'}>
                  {reviewCode.isUsed ? 'Usado' : 'Disponible'}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <span className="section-kicker">Servicios</span>
            <h2>Agrega todos los servicios que quiera mostrar la matrona</h2>
          </div>
        </div>

        <section className="card admin-card admin-create-service">
          <span className="section-kicker">Nuevo servicio</span>
          <p className="section-lead">
            La landing ya no depende de 1 o 3 servicios fijos. Desde aqui puede crear todos los
            que necesite.
          </p>

          <form onSubmit={handleCreateService} className="stack-form">
            <input
              required
              placeholder="Titulo del servicio"
              value={newServiceForm.title}
              onChange={(event) =>
                setNewServiceForm((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <textarea
              required
              placeholder="Descripcion del servicio"
              value={newServiceForm.description}
              onChange={(event) =>
                setNewServiceForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
            <input
              placeholder="URL de imagen"
              value={newServiceForm.imageUrl}
              onChange={(event) =>
                setNewServiceForm((prev) => ({ ...prev, imageUrl: event.target.value }))
              }
            />
            <button type="submit" disabled={busyAction === 'create-service'}>
              {busyAction === 'create-service' ? 'Creando...' : 'Agregar servicio'}
            </button>
          </form>
        </section>

        <div className="admin-service-grid">
          {services.map((service) => (
            <form
              key={service.id}
              onSubmit={(event) => handleServiceUpdate(event, service.id)}
              className="card admin-card stack-form"
            >
              <strong className="admin-card-id">Servicio #{service.id}</strong>
              <input
                required
                placeholder="Titulo"
                value={service.title}
                onChange={(event) =>
                  handleServiceChange(service.id, 'title', event.target.value)
                }
              />
              <textarea
                required
                placeholder="Descripcion"
                value={service.description}
                onChange={(event) =>
                  handleServiceChange(service.id, 'description', event.target.value)
                }
              />
              <input
                placeholder="URL imagen"
                value={service.imageUrl}
                onChange={(event) =>
                  handleServiceChange(service.id, 'imageUrl', event.target.value)
                }
              />
              <div className="admin-actions-row">
                <button type="submit" disabled={busyAction === `service-${service.id}`}>
                  {busyAction === `service-${service.id}` ? 'Guardando...' : 'Guardar servicio'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteService(service.id)}
                  disabled={busyAction === `delete-service-${service.id}`}
                >
                  {busyAction === `delete-service-${service.id}` ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>

      <section className="card admin-card">
        <div className="admin-section-head">
          <div>
            <span className="section-kicker">Comentarios</span>
            <h2>Moderacion</h2>
          </div>
        </div>

        <div className="admin-list">
          {(dashboard?.testimonials || []).length ? (
            dashboard.testimonials.map((testimonial) => (
              <article key={testimonial.id} className="admin-list-item admin-list-item-wide">
                <div>
                  <div className="admin-comment-head">
                    <strong>{testimonial.patientNameAlias}</strong>
                    <span className={`status-pill ${testimonial.status}`}>
                      {testimonial.status}
                    </span>
                  </div>
                  <p>{testimonial.content}</p>
                  <small>{formatDate(testimonial.createdAt)}</small>
                </div>

                <div className="admin-actions-row">
                  {testimonial.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(testimonial.id)}
                      disabled={busyAction === `approve-${testimonial.id}`}
                    >
                      {busyAction === `approve-${testimonial.id}` ? 'Aprobando...' : 'Aprobar'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={busyAction === `delete-${testimonial.id}`}
                  >
                    {busyAction === `delete-${testimonial.id}` ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="section-lead">Todavia no hay comentarios para moderar.</p>
          )}
        </div>
      </section>

      {message && <p className="notice">{message}</p>}
    </main>
  );
}
