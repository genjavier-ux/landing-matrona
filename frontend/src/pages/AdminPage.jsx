import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createAdminTestimonial,
  createService,
  deleteService,
  deleteTestimonial,
  fetchAdminDashboard,
  updateAdminTestimonial,
  updateSection,
  updateService,
  updateWeeklyAvailability
} from '../services/api';

const adminTabs = [
  { id: 'pages', label: 'Paginas' },
  { id: 'booking', label: 'Horarios' },
  { id: 'services', label: 'Servicios' },
  { id: 'testimonials', label: 'Testimonios' }
];

const bookingDays = [
  { dayOfWeek: 0, label: 'Domingo', shortLabel: 'Dom' },
  { dayOfWeek: 1, label: 'Lunes', shortLabel: 'Lun' },
  { dayOfWeek: 2, label: 'Martes', shortLabel: 'Mar' },
  { dayOfWeek: 3, label: 'Miercoles', shortLabel: 'Mie' },
  { dayOfWeek: 4, label: 'Jueves', shortLabel: 'Jue' },
  { dayOfWeek: 5, label: 'Viernes', shortLabel: 'Vie' },
  { dayOfWeek: 6, label: 'Sabado', shortLabel: 'Sab' }
];

const editableSections = [
  {
    key: 'hero',
    label: 'Inicio',
    description: 'Titulo y texto principal del hero de la landing.'
  },
  {
    key: 'about',
    label: 'Sobre mi',
    description: 'Presentacion editable para la pagina sobre mi.'
  },
  {
    key: 'services',
    label: 'Servicios',
    description: 'Encabezado e introduccion de la pagina de servicios.'
  },
  {
    key: 'comments',
    label: 'Comentarios',
    description: 'Titulo y texto de apoyo de la pagina de testimonios.'
  },
  {
    key: 'contact',
    label: 'Contacto',
    description: 'Texto introductorio de la pagina de contacto.'
  },
  {
    key: 'booking',
    label: 'Reservar hora',
    description: 'Texto principal que acompana la agenda online.'
  }
];

const defaultSectionContent = {
  hero: {
    title: 'Atencion medica clara, cercana y sin friccion',
    content: 'Reserva tu hora y navega por la pagina con una experiencia limpia, abierta y continua.'
  },
  about: {
    title: 'Sobre mi',
    content:
      'Acompanamiento profesional con una mirada cercana, clara y humana en cada etapa de la atencion.'
  },
  services: {
    title: 'Servicios',
    content: 'Explora prestaciones pensadas para seguimiento, orientacion y cuidado continuo.'
  },
  comments: {
    title: 'Testimonios',
    content: 'Comentarios reales de pacientes sobre su experiencia de atencion.'
  },
  contact: {
    title: 'Contacto',
    content: 'Escribenos para resolver dudas, solicitar informacion o coordinar tu atencion.'
  },
  booking: {
    title: 'Agenda tu atencion',
    content:
      'Selecciona el dia y luego una hora disponible en un calendario visual conectado a la agenda real.'
  }
};

const durationOptions = [30, 45, 60, 90, 120];
const testimonialStatusOptions = ['pending', 'approved', 'rejected'];

const initialServiceForm = {
  title: '',
  description: '',
  price: '0',
  currency: 'CLP',
  durationMinutes: '60',
  imageUrl: '',
  isActive: true,
  orderIndex: '0'
};

const initialTestimonialForm = {
  patientNameAlias: '',
  content: '',
  rating: '5',
  status: 'approved',
  isVisible: true
};

const normalizeWeeklyAvailability = (rows = []) => {
  const rowMap = new Map(rows.map((item) => [Number(item.dayOfWeek), item]));

  return bookingDays.map((day) => {
    const row = rowMap.get(day.dayOfWeek);

    return {
      dayOfWeek: day.dayOfWeek,
      label: day.label,
      shortLabel: day.shortLabel,
      isEnabled: Boolean(row?.isEnabled),
      startTime: row?.startTime ? String(row.startTime).slice(0, 5) : '08:00',
      endTime: row?.endTime ? String(row.endTime).slice(0, 5) : '17:00',
      slotMinutes: Number(row?.slotMinutes || 60)
    };
  });
};

const normalizeSections = (rows = []) => {
  const rowMap = new Map(rows.map((item) => [item.key, item]));

  return editableSections.map((section) => {
    const row = rowMap.get(section.key);
    const fallback = defaultSectionContent[section.key];

    return {
      ...section,
      title: row?.title || fallback.title,
      content: row?.content || fallback.content
    };
  });
};

const normalizeServices = (rows = []) =>
  rows.map((service) => ({
    ...service,
    price: String(service.price ?? '0'),
    currency: service.currency || 'CLP',
    durationMinutes: String(service.durationMinutes ?? 60),
    imageUrl: service.imageUrl || '',
    isActive: Boolean(service.isActive),
    orderIndex: String(service.orderIndex ?? 0)
  }));

const normalizeTestimonials = (rows = []) =>
  rows.map((item) => ({
    ...item,
    rating: String(item.rating ?? 5),
    status: item.status || 'pending',
    isVisible: Boolean(item.isVisible)
  }));

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export default function AdminPage() {
  const navigate = useNavigate();
  const token = window.localStorage.getItem('matrona-token');

  const [activeTab, setActiveTab] = useState('pages');
  const [dashboard, setDashboard] = useState(null);
  const [pageSections, setPageSections] = useState(normalizeSections());
  const [bookingSettings, setBookingSettings] = useState(normalizeWeeklyAvailability());
  const [services, setServices] = useState([]);
  const [newServiceForm, setNewServiceForm] = useState(initialServiceForm);
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonialForm, setNewTestimonialForm] = useState(initialTestimonialForm);
  const [pageStatus, setPageStatus] = useState({ type: '', message: '' });
  const [bookingStatus, setBookingStatus] = useState({ type: '', message: '' });
  const [serviceStatus, setServiceStatus] = useState({ type: '', message: '' });
  const [testimonialStatus, setTestimonialStatus] = useState({ type: '', message: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');

  const applyDashboard = (response) => {
    setDashboard(response);
    setPageSections(normalizeSections(response.sections));
    setBookingSettings(normalizeWeeklyAvailability(response.weeklyAvailability));
    setServices(normalizeServices(response.services));
    setTestimonials(normalizeTestimonials(response.testimonials));
  };

  const handleUnauthorized = (error) => {
    if (error?.response?.status === 401) {
      window.localStorage.removeItem('matrona-token');
      navigate('/login', { replace: true });
      return true;
    }

    return false;
  };

  const refreshDashboard = async (authToken) => {
    const response = await fetchAdminDashboard(authToken);
    applyDashboard(response);
    return response;
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await fetchAdminDashboard(token);
        if (isMounted) {
          applyDashboard(response);
          setErrorMessage('');
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (!handleUnauthorized(error)) {
          setErrorMessage(getErrorMessage(error, 'No fue posible cargar el dashboard.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate, token]);

  const handleLogout = () => {
    window.localStorage.removeItem('matrona-token');
    navigate('/login', { replace: true });
  };

  const handleSectionFieldChange = (key, field, value) => {
    setPageSections((currentValue) =>
      currentValue.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveSection = async (key) => {
    const section = pageSections.find((item) => item.key === key);
    if (!section) {
      return;
    }

    setBusyAction(`section:${key}`);
    setPageStatus({ type: '', message: '' });

    try {
      const response = await updateSection(
        key,
        {
          title: section.title,
          content: section.content
        },
        token
      );
      await refreshDashboard(token);
      setPageStatus({
        type: 'success',
        message: response.message || `Seccion ${section.label} actualizada.`
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setPageStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible guardar la pagina.')
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleBookingFieldChange = (dayOfWeek, key, value) => {
    setBookingSettings((currentValue) =>
      currentValue.map((item) =>
        item.dayOfWeek === dayOfWeek
          ? {
              ...item,
              [key]: key === 'isEnabled' ? value : value
            }
          : item
      )
    );
  };

  const handleSaveBooking = async () => {
    const invalidRow = bookingSettings.find(
      (item) => item.isEnabled && (!item.startTime || !item.endTime || item.startTime >= item.endTime)
    );

    if (invalidRow) {
      setBookingStatus({
        type: 'error',
        message: `Revisa el horario configurado para ${invalidRow.label}.`
      });
      return;
    }

    setBusyAction('booking');
    setBookingStatus({ type: '', message: '' });

    try {
      const payload = {
        availability: bookingSettings.map((item) => ({
          dayOfWeek: item.dayOfWeek,
          isEnabled: item.isEnabled,
          startTime: item.startTime,
          endTime: item.endTime,
          slotMinutes: Number(item.slotMinutes)
        }))
      };

      const response = await updateWeeklyAvailability(payload, token);
      await refreshDashboard(token);
      setBookingStatus({
        type: 'success',
        message: response.message || 'Configuracion del booking guardada.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setBookingStatus({
        type: 'error',
        message:
          getErrorMessage(error, 'No fue posible guardar la configuracion del booking.')
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleNewServiceChange = (field, value) => {
    setNewServiceForm((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };

  const handleServiceFieldChange = (serviceId, field, value) => {
    setServices((currentValue) =>
      currentValue.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              [field]: value
            }
          : service
      )
    );
  };

  const handleCreateService = async () => {
    if (!newServiceForm.title || !newServiceForm.description) {
      setServiceStatus({
        type: 'error',
        message: 'El servicio requiere titulo y descripcion.'
      });
      return;
    }

    setBusyAction('create-service');
    setServiceStatus({ type: '', message: '' });

    try {
      const response = await createService(
        {
          ...newServiceForm,
          price: Number(newServiceForm.price || 0),
          durationMinutes: Number(newServiceForm.durationMinutes || 60),
          orderIndex: Number(newServiceForm.orderIndex || 0)
        },
        token
      );
      setNewServiceForm(initialServiceForm);
      await refreshDashboard(token);
      setServiceStatus({
        type: 'success',
        message: response.message || 'Servicio creado.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setServiceStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible crear el servicio.')
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleSaveService = async (serviceId) => {
    const service = services.find((item) => item.id === serviceId);
    if (!service) {
      return;
    }

    setBusyAction(`service:${serviceId}`);
    setServiceStatus({ type: '', message: '' });

    try {
      const response = await updateService(
        serviceId,
        {
          ...service,
          price: Number(service.price || 0),
          durationMinutes: Number(service.durationMinutes || 60),
          orderIndex: Number(service.orderIndex || 0)
        },
        token
      );
      await refreshDashboard(token);
      setServiceStatus({
        type: 'success',
        message: response.message || 'Servicio actualizado.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setServiceStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible actualizar el servicio.')
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteService = async (serviceId) => {
    const shouldDelete = window.confirm('Este servicio se eliminara de la pagina. Quieres continuar?');
    if (!shouldDelete) {
      return;
    }

    setBusyAction(`delete-service:${serviceId}`);
    setServiceStatus({ type: '', message: '' });

    try {
      const response = await deleteService(serviceId, token);
      await refreshDashboard(token);
      setServiceStatus({
        type: 'success',
        message: response.message || 'Servicio eliminado.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setServiceStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible eliminar el servicio.')
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleNewTestimonialChange = (field, value) => {
    setNewTestimonialForm((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };

  const handleTestimonialFieldChange = (testimonialId, field, value) => {
    setTestimonials((currentValue) =>
      currentValue.map((item) =>
        item.id === testimonialId
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const handleCreateTestimonial = async () => {
    if (!newTestimonialForm.patientNameAlias || !newTestimonialForm.content) {
      setTestimonialStatus({
        type: 'error',
        message: 'El comentario requiere alias y contenido.'
      });
      return;
    }

    setBusyAction('create-testimonial');
    setTestimonialStatus({ type: '', message: '' });

    try {
      const response = await createAdminTestimonial(
        {
          ...newTestimonialForm,
          rating: Number(newTestimonialForm.rating || 5)
        },
        token
      );
      setNewTestimonialForm(initialTestimonialForm);
      await refreshDashboard(token);
      setTestimonialStatus({
        type: 'success',
        message: response.message || 'Comentario creado.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setTestimonialStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible crear el comentario.')
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleSaveTestimonial = async (testimonialId) => {
    const testimonial = testimonials.find((item) => item.id === testimonialId);
    if (!testimonial) {
      return;
    }

    setBusyAction(`testimonial:${testimonialId}`);
    setTestimonialStatus({ type: '', message: '' });

    try {
      const response = await updateAdminTestimonial(
        testimonialId,
        {
          ...testimonial,
          rating: Number(testimonial.rating || 5)
        },
        token
      );
      await refreshDashboard(token);
      setTestimonialStatus({
        type: 'success',
        message: response.message || 'Comentario actualizado.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setTestimonialStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible actualizar el comentario.')
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    const shouldDelete = window.confirm('Este comentario se eliminara. Quieres continuar?');
    if (!shouldDelete) {
      return;
    }

    setBusyAction(`delete-testimonial:${testimonialId}`);
    setTestimonialStatus({ type: '', message: '' });

    try {
      const response = await deleteTestimonial(testimonialId, token);
      await refreshDashboard(token);
      setTestimonialStatus({
        type: 'success',
        message: response.message || 'Comentario eliminado.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setTestimonialStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible eliminar el comentario.')
      });
    } finally {
      setBusyAction('');
    }
  };

  if (!token) {
    return (
      <section className="placeholder-section">
        <div className="placeholder-card admin-empty">
          <span className="section-tag">Panel</span>
          <h1>Necesitas iniciar sesion</h1>
          <Link to="/login" className="button button-primary">
            Ir a login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <span className="section-tag">Dashboard</span>
          <h1>Panel administrativo</h1>
        </div>

        <button type="button" className="button button-secondary" onClick={handleLogout}>
          Cerrar sesion
        </button>
      </div>

      {isLoading ? <p className="status-note">Cargando datos del panel...</p> : null}
      {errorMessage ? <p className="form-status error">{errorMessage}</p> : null}

      {dashboard ? (
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-card">
              <span className="section-tag">Menu</span>
              <div className="admin-tab-list">
                {adminTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`admin-tab-button ${activeTab === tab.id ? 'is-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-sidebar-card">
              <span className="flow-label">Resumen</span>
              <div className="admin-mini-metrics">
                <div className="admin-mini-metric">
                  <strong>{pageSections.length}</strong>
                  <span>Paginas</span>
                </div>
                <div className="admin-mini-metric">
                  <strong>{services.length}</strong>
                  <span>Servicios</span>
                </div>
                <div className="admin-mini-metric">
                  <strong>{testimonials.length}</strong>
                  <span>Testimonios</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="admin-content-stack">
            <div className="admin-grid">
              <article className="metric-card admin-metric">
                <strong>{pageSections.length}</strong>
                <span>Secciones editables</span>
              </article>
              <article className="metric-card admin-metric">
                <strong>{services.length}</strong>
                <span>Servicios</span>
              </article>
              <article className="metric-card admin-metric">
                <strong>{testimonials.length}</strong>
                <span>Comentarios</span>
              </article>
              <article className="metric-card admin-metric">
                <strong>{dashboard.appointments?.length || 0}</strong>
                <span>Reservas recientes</span>
              </article>
            </div>

            {activeTab === 'pages' ? (
              <section className="admin-workspace">
                <div className="admin-workspace-header">
                  <span className="section-tag">Paginas</span>
                  <h2>Contenido editable del sitio</h2>
                  <p>
                    Edita los textos principales de inicio, sobre mi, servicios, comentarios,
                    contacto y reservar hora.
                  </p>
                </div>

                {pageStatus.message ? (
                  <p className={`form-status ${pageStatus.type}`}>{pageStatus.message}</p>
                ) : null}

                <div className="admin-section-grid">
                  {pageSections.map((section) => (
                    <article key={section.key} className="admin-editor-card">
                      <div className="admin-card-header">
                        <div>
                          <strong>{section.label}</strong>
                          <span>{section.description}</span>
                        </div>

                        <button
                          type="button"
                          className="button button-primary"
                          disabled={busyAction === `section:${section.key}`}
                          onClick={() => handleSaveSection(section.key)}
                        >
                          {busyAction === `section:${section.key}` ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>

                      <label className="field">
                        <span>Titulo</span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(event) =>
                            handleSectionFieldChange(section.key, 'title', event.target.value)
                          }
                        />
                      </label>

                      <label className="field">
                        <span>Contenido</span>
                        <textarea
                          value={section.content}
                          rows="5"
                          onChange={(event) =>
                            handleSectionFieldChange(section.key, 'content', event.target.value)
                          }
                        />
                      </label>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTab === 'booking' ? (
              <section className="admin-workspace">
                <div className="booking-config-header">
                  <div>
                    <span className="section-tag">Booking</span>
                    <h2>Configuracion de agenda</h2>
                    <p>
                      Activa los dias de trabajo, define horario de apertura y cierre, y elige la
                      duracion de cada bloque.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleSaveBooking}
                    disabled={busyAction === 'booking'}
                  >
                    {busyAction === 'booking' ? 'Guardando...' : 'Guardar horario'}
                  </button>
                </div>

                {bookingStatus.message ? (
                  <p className={`form-status ${bookingStatus.type}`}>{bookingStatus.message}</p>
                ) : null}

                <div className="booking-config-grid">
                  {bookingSettings.map((day) => (
                    <article key={day.dayOfWeek} className="booking-config-card">
                      <div className="booking-config-day">
                        <div>
                          <strong>{day.label}</strong>
                          <span>{day.shortLabel}</span>
                        </div>

                        <label className="booking-day-toggle">
                          <input
                            type="checkbox"
                            checked={day.isEnabled}
                            onChange={(event) =>
                              handleBookingFieldChange(
                                day.dayOfWeek,
                                'isEnabled',
                                event.target.checked
                              )
                            }
                          />
                          <span>{day.isEnabled ? 'Activo' : 'Cerrado'}</span>
                        </label>
                      </div>

                      <div className="booking-config-fields">
                        <label className="field">
                          <span>Inicio</span>
                          <input
                            type="time"
                            value={day.startTime}
                            disabled={!day.isEnabled}
                            onChange={(event) =>
                              handleBookingFieldChange(day.dayOfWeek, 'startTime', event.target.value)
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Termino</span>
                          <input
                            type="time"
                            value={day.endTime}
                            disabled={!day.isEnabled}
                            onChange={(event) =>
                              handleBookingFieldChange(day.dayOfWeek, 'endTime', event.target.value)
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Duracion</span>
                          <select
                            value={day.slotMinutes}
                            disabled={!day.isEnabled}
                            onChange={(event) =>
                              handleBookingFieldChange(day.dayOfWeek, 'slotMinutes', event.target.value)
                            }
                          >
                            {durationOptions.map((minutes) => (
                              <option key={minutes} value={minutes}>
                                {minutes} minutos
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTab === 'services' ? (
              <section className="admin-workspace">
                <div className="admin-workspace-header">
                  <span className="section-tag">Servicios</span>
                  <h2>CRUD de servicios</h2>
                  <p>
                    Crea, edita y elimina servicios. Estos datos se muestran automaticamente en la
                    pagina publica.
                  </p>
                </div>

                {serviceStatus.message ? (
                  <p className={`form-status ${serviceStatus.type}`}>{serviceStatus.message}</p>
                ) : null}

                <article className="admin-editor-card">
                  <div className="admin-card-header">
                    <div>
                      <strong>Nuevo servicio</strong>
                      <span>Agrega un servicio nuevo al catalogo publico.</span>
                    </div>

                    <button
                      type="button"
                      className="button button-primary"
                      disabled={busyAction === 'create-service'}
                      onClick={handleCreateService}
                    >
                      {busyAction === 'create-service' ? 'Creando...' : 'Crear servicio'}
                    </button>
                  </div>

                  <div className="field-grid admin-form-grid">
                    <label className="field">
                      <span>Titulo</span>
                      <input
                        type="text"
                        value={newServiceForm.title}
                        onChange={(event) => handleNewServiceChange('title', event.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>Precio</span>
                      <input
                        type="number"
                        min="0"
                        value={newServiceForm.price}
                        onChange={(event) => handleNewServiceChange('price', event.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>Duracion</span>
                      <select
                        value={newServiceForm.durationMinutes}
                        onChange={(event) =>
                          handleNewServiceChange('durationMinutes', event.target.value)
                        }
                      >
                        {durationOptions.map((minutes) => (
                          <option key={minutes} value={minutes}>
                            {minutes} minutos
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Orden</span>
                      <input
                        type="number"
                        min="0"
                        value={newServiceForm.orderIndex}
                        onChange={(event) => handleNewServiceChange('orderIndex', event.target.value)}
                      />
                    </label>

                    <label className="field admin-form-span-2">
                      <span>Imagen URL</span>
                      <input
                        type="url"
                        value={newServiceForm.imageUrl}
                        onChange={(event) => handleNewServiceChange('imageUrl', event.target.value)}
                      />
                    </label>

                    <label className="field admin-form-span-2">
                      <span>Descripcion</span>
                      <textarea
                        rows="4"
                        value={newServiceForm.description}
                        onChange={(event) => handleNewServiceChange('description', event.target.value)}
                      />
                    </label>
                  </div>
                </article>

                <div className="admin-section-grid">
                  {services.map((service) => (
                    <article key={service.id} className="admin-editor-card">
                      <div className="admin-card-header">
                        <div>
                          <strong>{service.title}</strong>
                          <span>ID {service.id}</span>
                        </div>

                        <div className="admin-card-actions">
                          <button
                            type="button"
                            className="button button-secondary"
                            disabled={busyAction === `service:${service.id}`}
                            onClick={() => handleSaveService(service.id)}
                          >
                            {busyAction === `service:${service.id}` ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            className="button button-secondary"
                            disabled={busyAction === `delete-service:${service.id}`}
                            onClick={() => handleDeleteService(service.id)}
                          >
                            {busyAction === `delete-service:${service.id}` ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </div>

                      <div className="field-grid admin-form-grid">
                        <label className="field">
                          <span>Titulo</span>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(event) =>
                              handleServiceFieldChange(service.id, 'title', event.target.value)
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Precio</span>
                          <input
                            type="number"
                            min="0"
                            value={service.price}
                            onChange={(event) =>
                              handleServiceFieldChange(service.id, 'price', event.target.value)
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Duracion</span>
                          <select
                            value={service.durationMinutes}
                            onChange={(event) =>
                              handleServiceFieldChange(service.id, 'durationMinutes', event.target.value)
                            }
                          >
                            {durationOptions.map((minutes) => (
                              <option key={minutes} value={minutes}>
                                {minutes} minutos
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field">
                          <span>Orden</span>
                          <input
                            type="number"
                            min="0"
                            value={service.orderIndex}
                            onChange={(event) =>
                              handleServiceFieldChange(service.id, 'orderIndex', event.target.value)
                            }
                          />
                        </label>

                        <label className="field admin-form-span-2">
                          <span>Imagen URL</span>
                          <input
                            type="url"
                            value={service.imageUrl}
                            onChange={(event) =>
                              handleServiceFieldChange(service.id, 'imageUrl', event.target.value)
                            }
                          />
                        </label>

                        <label className="field admin-inline-field">
                          <span>Activo</span>
                          <input
                            type="checkbox"
                            checked={service.isActive}
                            onChange={(event) =>
                              handleServiceFieldChange(service.id, 'isActive', event.target.checked)
                            }
                          />
                        </label>

                        <label className="field admin-form-span-2">
                          <span>Descripcion</span>
                          <textarea
                            rows="4"
                            value={service.description}
                            onChange={(event) =>
                              handleServiceFieldChange(service.id, 'description', event.target.value)
                            }
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTab === 'testimonials' ? (
              <section className="admin-workspace">
                <div className="admin-workspace-header">
                  <span className="section-tag">Testimonios</span>
                  <h2>CRUD de comentarios</h2>
                  <p>
                    Crea testimonios manualmente, edita contenido, controla visibilidad y elimina
                    comentarios desde el panel.
                  </p>
                </div>

                {testimonialStatus.message ? (
                  <p className={`form-status ${testimonialStatus.type}`}>{testimonialStatus.message}</p>
                ) : null}

                <article className="admin-editor-card">
                  <div className="admin-card-header">
                    <div>
                      <strong>Nuevo comentario</strong>
                      <span>Agrega un testimonio manual desde el panel.</span>
                    </div>

                    <button
                      type="button"
                      className="button button-primary"
                      disabled={busyAction === 'create-testimonial'}
                      onClick={handleCreateTestimonial}
                    >
                      {busyAction === 'create-testimonial' ? 'Creando...' : 'Crear comentario'}
                    </button>
                  </div>

                  <div className="field-grid admin-form-grid">
                    <label className="field">
                      <span>Alias</span>
                      <input
                        type="text"
                        value={newTestimonialForm.patientNameAlias}
                        onChange={(event) =>
                          handleNewTestimonialChange('patientNameAlias', event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Puntuacion</span>
                      <select
                        value={newTestimonialForm.rating}
                        onChange={(event) => handleNewTestimonialChange('rating', event.target.value)}
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} estrellas
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Estado</span>
                      <select
                        value={newTestimonialForm.status}
                        onChange={(event) => handleNewTestimonialChange('status', event.target.value)}
                      >
                        {testimonialStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field admin-inline-field">
                      <span>Visible</span>
                      <input
                        type="checkbox"
                        checked={newTestimonialForm.isVisible}
                        onChange={(event) =>
                          handleNewTestimonialChange('isVisible', event.target.checked)
                        }
                      />
                    </label>

                    <label className="field admin-form-span-2">
                      <span>Contenido</span>
                      <textarea
                        rows="4"
                        value={newTestimonialForm.content}
                        onChange={(event) => handleNewTestimonialChange('content', event.target.value)}
                      />
                    </label>
                  </div>
                </article>

                <div className="admin-section-grid">
                  {testimonials.map((testimonial) => (
                    <article key={testimonial.id} className="admin-editor-card">
                      <div className="admin-card-header">
                        <div>
                          <strong>{testimonial.patientNameAlias}</strong>
                          <span>{testimonial.createdAt ? String(testimonial.createdAt) : `ID ${testimonial.id}`}</span>
                        </div>

                        <div className="admin-card-actions">
                          <button
                            type="button"
                            className="button button-secondary"
                            disabled={busyAction === `testimonial:${testimonial.id}`}
                            onClick={() => handleSaveTestimonial(testimonial.id)}
                          >
                            {busyAction === `testimonial:${testimonial.id}` ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            className="button button-secondary"
                            disabled={busyAction === `delete-testimonial:${testimonial.id}`}
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                          >
                            {busyAction === `delete-testimonial:${testimonial.id}` ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </div>

                      <div className="field-grid admin-form-grid">
                        <label className="field">
                          <span>Alias</span>
                          <input
                            type="text"
                            value={testimonial.patientNameAlias}
                            onChange={(event) =>
                              handleTestimonialFieldChange(
                                testimonial.id,
                                'patientNameAlias',
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Puntuacion</span>
                          <select
                            value={testimonial.rating}
                            onChange={(event) =>
                              handleTestimonialFieldChange(testimonial.id, 'rating', event.target.value)
                            }
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating} estrellas
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field">
                          <span>Estado</span>
                          <select
                            value={testimonial.status}
                            onChange={(event) =>
                              handleTestimonialFieldChange(testimonial.id, 'status', event.target.value)
                            }
                          >
                            {testimonialStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field admin-inline-field">
                          <span>Visible</span>
                          <input
                            type="checkbox"
                            checked={testimonial.isVisible}
                            onChange={(event) =>
                              handleTestimonialFieldChange(
                                testimonial.id,
                                'isVisible',
                                event.target.checked
                              )
                            }
                          />
                        </label>

                        <label className="field admin-form-span-2">
                          <span>Contenido</span>
                          <textarea
                            rows="4"
                            value={testimonial.content}
                            onChange={(event) =>
                              handleTestimonialFieldChange(testimonial.id, 'content', event.target.value)
                            }
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
