import { useEffect, useState } from 'react';
import {
  approveTestimonial,
  createReviewCode,
  createService,
  deleteService,
  deleteTestimonial,
  fetchAdminDashboard,
  login,
  updateSection,
  updateService
} from '../services/api';
import {
  AdminLoadingPanel,
  AdminLoginPanel,
  AdminToolbar,
  HeroEditorPanel,
  ReviewCodesPanel,
  ServiceCreatePanel,
  ServiceEditorGrid,
  TestimonialsModerationTable
} from '../components/admin';
import { GridShell, NoticeBanner } from '../components/ui';

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
  const [testimonialFilter, setTestimonialFilter] = useState('all');
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
      'Este servicio se eliminara de la landing. Quieres continuar?'
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

  const pendingTestimonials =
    dashboard?.testimonials?.filter((testimonial) => testimonial.status === 'pending') || [];

  const filteredTestimonials = (() => {
    const testimonials = dashboard?.testimonials || [];

    if (testimonialFilter === 'all') return testimonials;

    return testimonials.filter((testimonial) => testimonial.status === testimonialFilter);
  })();

  if (!token) {
    return (
      <AdminLoginPanel
        credentials={credentials}
        isLoggingIn={isLoggingIn}
        message={message}
        onSubmit={handleLogin}
        onCredentialsChange={(field, value) =>
          setCredentials((prev) => ({ ...prev, [field]: value }))
        }
      />
    );
  }

  if (isLoadingDashboard && !dashboard) {
    return <AdminLoadingPanel />;
  }

  return (
    <main className="layout admin-shell">
      <AdminToolbar
        serviceCount={services.length}
        pendingCount={pendingTestimonials.length}
        onLogout={handleLogout}
      />

      <GridShell className="admin-grid">
        <HeroEditorPanel
          heroForm={heroForm}
          busyAction={busyAction}
          onSubmit={handleHeroUpdate}
          onChange={(field, value) => setHeroForm((prev) => ({ ...prev, [field]: value }))}
        />

        <ReviewCodesPanel
          codeForm={codeForm}
          reviewCodes={dashboard?.reviewCodes || []}
          busyAction={busyAction}
          formatDate={formatDate}
          onSubmit={handleReviewCodeCreate}
          onChange={(field, value) => setCodeForm((prev) => ({ ...prev, [field]: value }))}
        />
      </GridShell>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <span className="section-kicker">Servicios</span>
            <h2>Agrega todos los servicios que quiera mostrar la matrona</h2>
          </div>
        </div>

        <ServiceCreatePanel
          form={newServiceForm}
          busyAction={busyAction}
          onSubmit={handleCreateService}
          onChange={(field, value) =>
            setNewServiceForm((prev) => ({ ...prev, [field]: value }))
          }
        />

        <ServiceEditorGrid
          services={services}
          busyAction={busyAction}
          onChange={handleServiceChange}
          onSubmit={handleServiceUpdate}
          onDelete={handleDeleteService}
        />
      </section>

      <TestimonialsModerationTable
        testimonials={filteredTestimonials}
        filterValue={testimonialFilter}
        busyAction={busyAction}
        formatDate={formatDate}
        onFilterChange={setTestimonialFilter}
        onApprove={handleApprove}
        onDelete={handleDelete}
      />

      {message ? <NoticeBanner>{message}</NoticeBanner> : null}
    </main>
  );
}
