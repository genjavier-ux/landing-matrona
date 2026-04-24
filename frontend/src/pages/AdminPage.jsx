import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createAdminTestimonial,
  createGalleryItem,
  createService,
  deleteGalleryItem,
  deleteService,
  deleteTestimonial,
  fetchAdminAppointments,
  fetchAdminDashboard,
  updateAdminTestimonial,
  updateGalleryItem,
  updateSection,
  updateService,
  updateWeeklyAvailability
} from '../services/api';
import AppModal from '../components/AppModal';
import ServiceEditorModal from '../components/ServiceEditorModal';
import { clearPublicContentCache } from '../hooks/usePublicContent';

const adminTabs = [
  {
    id: 'pages',
    label: 'Pages',
    shortLabel: 'PG',
    icon: 'pages',
    description: 'Organiza la estructura interna del panel y el contenido publico del sitio.'
  },
  {
    id: 'reservations',
    label: 'Reservas',
    shortLabel: 'RS',
    icon: 'calendar',
    description: 'Revisa la agenda semanal con un layout tipo agenda y acceso a cada reserva.'
  },
  {
    id: 'booking',
    label: 'Horarios',
    shortLabel: 'HR',
    icon: 'clock',
    description: 'Define disponibilidad, bloques y dias activos para la reserva online.'
  },
  {
    id: 'services',
    label: 'Servicios',
    shortLabel: 'SV',
    icon: 'grid',
    description: 'Gestiona el catalogo, imagenes y visibilidad de cada prestacion.'
  },
  {
    id: 'testimonials',
    label: 'Testimonios',
    shortLabel: 'TS',
    icon: 'chat',
    description: 'Administra comentarios visibles, pendientes y respuestas del sitio.'
  }
];

const adminPageViews = [
  {
    id: 'admin',
    label: 'Admin Pages',
    description: 'Entradas internas del panel y accesos rapidos para la operacion diaria.'
  },
  {
    id: 'landing',
    label: 'Landing Pages',
    description: 'Paginas publicas de la web con su texto y narrativa editable.'
  }
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
const appointmentStatusLabels = {
  new: 'Nueva',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada'
};
const weekRangeFormatter = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'long'
});
const weekDayFormatter = new Intl.DateTimeFormat('es-CL', {
  weekday: 'long'
});
const weekDayDateFormatter = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'short'
});
const appointmentDateFormatter = new Intl.DateTimeFormat('es-CL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});
const getInitialAdminSidebarCollapsed = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const storedValue = window.localStorage.getItem('matrona-admin-sidebar-collapsed');

  if (storedValue === 'true') {
    return true;
  }

  if (storedValue === 'false') {
    return false;
  }

  return window.innerWidth < 1080;
};

const initialServiceForm = {
  title: '',
  description: '',
  price: '0',
  currency: 'CLP',
  durationMinutes: '60',
  images: [],
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

const initialHeroVisualForm = {
  title: '',
  description: '',
  imageUrl: '',
  isActive: true,
  orderIndex: '0'
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`No fue posible leer ${file.name}.`));
    reader.readAsDataURL(file);
  });

const capitalizeText = (value = '') =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const nextDate = new Date(value);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate;
  }

  const safeValue = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safeValue)) {
    return null;
  }

  const [year, month, day] = safeValue.split('-').map(Number);
  const nextDate = new Date(year, month - 1, day);

  if (
    nextDate.getFullYear() !== year ||
    nextDate.getMonth() !== month - 1 ||
    nextDate.getDate() !== day
  ) {
    return null;
  }

  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const startOfWeek = (value) => {
  const nextDate = parseDateKey(value) || new Date();
  const dayOfWeek = nextDate.getDay();
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  nextDate.setDate(nextDate.getDate() - offset);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const addDays = (value, daysToAdd) => {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const formatWeekRange = (weekStartDate) => {
  const weekEndDate = addDays(weekStartDate, 6);
  return `${capitalizeText(weekRangeFormatter.format(weekStartDate))} - ${weekRangeFormatter.format(weekEndDate)}`;
};

const parseTimeToMinutes = (value) => {
  const safeValue = String(value || '').slice(0, 5);

  if (!/^\d{2}:\d{2}$/.test(safeValue)) {
    return null;
  }

  const [hours, minutes] = safeValue.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatMinutesToTime = (value) => {
  if (!Number.isFinite(value)) {
    return '';
  }

  const hours = `${Math.floor(value / 60)}`.padStart(2, '0');
  const minutes = `${value % 60}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const sortTimeValues = (leftValue, rightValue) =>
  (parseTimeToMinutes(leftValue) ?? 0) - (parseTimeToMinutes(rightValue) ?? 0);

const buildDaySlotRows = (schedule, appointments = []) => {
  const slotTimes = new Set();

  if (schedule?.isEnabled && schedule.startTime && schedule.endTime && schedule.slotMinutes) {
    const startMinutes = parseTimeToMinutes(schedule.startTime);
    const endMinutes = parseTimeToMinutes(schedule.endTime);

    if (startMinutes !== null && endMinutes !== null && startMinutes < endMinutes) {
      for (
        let currentMinutes = startMinutes;
        currentMinutes + Number(schedule.slotMinutes) <= endMinutes;
        currentMinutes += Number(schedule.slotMinutes)
      ) {
        slotTimes.add(formatMinutesToTime(currentMinutes));
      }
    }
  }

  appointments.forEach((appointment) => {
    if (appointment.preferredTime) {
      slotTimes.add(appointment.preferredTime);
    }
  });

  const appointmentMap = new Map(
    appointments.map((appointment) => [appointment.preferredTime, appointment])
  );

  return [...slotTimes].sort(sortTimeValues).map((time) => ({
    time,
    appointment: appointmentMap.get(time) || null
  }));
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
    images: Array.isArray(service.images)
      ? service.images
      : service.imageUrl
        ? [service.imageUrl]
        : [],
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

const normalizeGalleryItems = (rows = []) =>
  rows.map((item) => ({
    ...item,
    title: item.title || '',
    description: item.description || '',
    imageUrl: item.imageUrl || '',
    isActive: Boolean(item.isActive),
    orderIndex: String(item.orderIndex ?? 0)
  }));

const normalizeAppointments = (rows = []) =>
  rows.map((item) => {
    const parsedDate = parseDateKey(item.preferredDate);

    return {
      ...item,
      preferredDate: parsedDate ? formatDateKey(parsedDate) : String(item.preferredDate || '').slice(0, 10),
      preferredTime: item.preferredTime ? String(item.preferredTime).slice(0, 5) : '',
      endTime: item.endTime ? String(item.endTime).slice(0, 5) : '',
      slotMinutes: Number(item.slotMinutes || 0),
      notes: item.notes || '',
      status: item.status || 'new'
    };
  });

const getAppointmentStatusClassName = (status) => {
  if (status === 'confirmed') {
    return 'is-confirmed';
  }

  if (status === 'completed') {
    return 'is-completed';
  }

  if (status === 'cancelled') {
    return 'is-cancelled';
  }

  return 'is-new';
};

function AdminTabIcon({ icon }) {
  if (icon === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4.5" y="6.5" width="15" height="13" rx="3" />
        <path d="M8 4.5v4M16 4.5v4M4.5 10.5h15" />
      </svg>
    );
  }

  if (icon === 'clock') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="7.5" />
        <path d="M12 8.5v4.2l2.8 1.8" />
      </svg>
    );
  }

  if (icon === 'grid') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.8" />
        <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.8" />
        <rect x="4.5" y="13" width="6.5" height="6.5" rx="1.8" />
        <rect x="13" y="13" width="6.5" height="6.5" rx="1.8" />
      </svg>
    );
  }

  if (icon === 'chat') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6.5h12a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 18 16.5H10l-4 3v-3H6A2.5 2.5 0 0 1 3.5 14V9A2.5 2.5 0 0 1 6 6.5Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="5" width="15" height="14" rx="3" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </svg>
  );
}

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export default function AdminPage() {
  const navigate = useNavigate();
  const token = window.localStorage.getItem('matrona-token');

  const [activeTab, setActiveTab] = useState('pages');
  const [dashboard, setDashboard] = useState(null);
  const [pageSections, setPageSections] = useState(normalizeSections());
  const [pagesView, setPagesView] = useState('admin');
  const [bookingSettings, setBookingSettings] = useState(normalizeWeeklyAvailability());
  const [services, setServices] = useState([]);
  const [heroVisuals, setHeroVisuals] = useState([]);
  const [newHeroVisual, setNewHeroVisual] = useState(initialHeroVisualForm);
  const [serviceModal, setServiceModal] = useState({
    isOpen: false,
    mode: 'create',
    service: initialServiceForm
  });
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonialForm, setNewTestimonialForm] = useState(initialTestimonialForm);
  const [pageStatus, setPageStatus] = useState({ type: '', message: '' });
  const [heroVisualStatus, setHeroVisualStatus] = useState({ type: '', message: '' });
  const [bookingStatus, setBookingStatus] = useState({ type: '', message: '' });
  const [serviceStatus, setServiceStatus] = useState({ type: '', message: '' });
  const [testimonialStatus, setTestimonialStatus] = useState({ type: '', message: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getInitialAdminSidebarCollapsed);
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => startOfWeek(new Date()));
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const applyDashboard = (response) => {
    setDashboard(response);
    setPageSections(normalizeSections(response.sections));
    setBookingSettings(normalizeWeeklyAvailability(response.weeklyAvailability));
    setServices(normalizeServices(response.services));
    setHeroVisuals(normalizeGalleryItems(response.gallery));
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      'matrona-admin-sidebar-collapsed',
      String(isSidebarCollapsed)
    );
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!token) {
      setWeeklyAppointments([]);
      setAppointmentsError('');
      setIsLoadingAppointments(false);
      return;
    }

    if (activeTab !== 'reservations') {
      setIsLoadingAppointments(false);
      return;
    }

    let isMounted = true;

    const loadWeeklyAppointments = async () => {
      setIsLoadingAppointments(true);
      setAppointmentsError('');
      setWeeklyAppointments([]);

      try {
        const response = await fetchAdminAppointments(token, {
          from: formatDateKey(selectedWeekStart),
          to: formatDateKey(addDays(selectedWeekStart, 6))
        });

        if (isMounted) {
          setWeeklyAppointments(normalizeAppointments(response));
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (!handleUnauthorized(error)) {
          setAppointmentsError(
            getErrorMessage(error, 'No fue posible cargar las reservas de la semana.')
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingAppointments(false);
        }
      }
    };

    loadWeeklyAppointments();

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedWeekStart, token]);

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
      clearPublicContentCache();
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

  const handleHeroVisualFieldChange = (visualId, field, value) => {
    setHeroVisuals((currentValue) =>
      currentValue.map((item) => (item.id === visualId ? { ...item, [field]: value } : item))
    );
  };

  const handleNewHeroVisualFieldChange = (field, value) => {
    setNewHeroVisual((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };

  const handleHeroVisualUpload = async (event, visualId = null) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setHeroVisualStatus({
        type: 'error',
        message: 'Solo puedes cargar archivos de imagen para el hero.'
      });
      return;
    }

    try {
      const imageUrl = await readFileAsDataUrl(selectedFile);

      if (visualId) {
        handleHeroVisualFieldChange(visualId, 'imageUrl', imageUrl);
      } else {
        handleNewHeroVisualFieldChange('imageUrl', imageUrl);
      }

      setHeroVisualStatus({
        type: 'success',
        message: 'Imagen del hero cargada correctamente.'
      });
    } catch (error) {
      setHeroVisualStatus({
        type: 'error',
        message: error.message || 'No fue posible procesar la imagen del hero.'
      });
    }
  };

  const handleCreateHeroVisual = async () => {
    if (!newHeroVisual.title || !newHeroVisual.imageUrl) {
      setHeroVisualStatus({
        type: 'error',
        message: 'Cada visual del hero necesita un nombre y una imagen.'
      });
      return;
    }

    setBusyAction('create-hero-visual');
    setHeroVisualStatus({ type: '', message: '' });

    try {
      const response = await createGalleryItem(
        {
          ...newHeroVisual,
          orderIndex: Number(newHeroVisual.orderIndex || 0)
        },
        token
      );
      await refreshDashboard(token);
      clearPublicContentCache();
      setNewHeroVisual(initialHeroVisualForm);
      setHeroVisualStatus({
        type: 'success',
        message: response.message || 'Visual del hero creado.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setHeroVisualStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible crear el visual del hero.')
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleSaveHeroVisual = async (visualId) => {
    const visual = heroVisuals.find((item) => item.id === visualId);
    if (!visual) {
      return;
    }

    if (!visual.title || !visual.imageUrl) {
      setHeroVisualStatus({
        type: 'error',
        message: 'Cada visual del hero necesita un nombre y una imagen.'
      });
      return;
    }

    setBusyAction(`hero-visual:${visualId}`);
    setHeroVisualStatus({ type: '', message: '' });

    try {
      const response = await updateGalleryItem(
        visualId,
        {
          ...visual,
          orderIndex: Number(visual.orderIndex || 0)
        },
        token
      );
      await refreshDashboard(token);
      clearPublicContentCache();
      setHeroVisualStatus({
        type: 'success',
        message: response.message || 'Visual del hero actualizado.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setHeroVisualStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible guardar el visual del hero.')
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteHeroVisual = async (visualId) => {
    const shouldDelete = window.confirm(
      'Este visual dejara de estar disponible en el inicio. Quieres continuar?'
    );
    if (!shouldDelete) {
      return;
    }

    setBusyAction(`delete-hero-visual:${visualId}`);
    setHeroVisualStatus({ type: '', message: '' });

    try {
      const response = await deleteGalleryItem(visualId, token);
      await refreshDashboard(token);
      clearPublicContentCache();
      setHeroVisualStatus({
        type: 'success',
        message: response.message || 'Visual del hero eliminado.'
      });
    } catch (error) {
      if (handleUnauthorized(error)) {
        return;
      }

      setHeroVisualStatus({
        type: 'error',
        message: getErrorMessage(error, 'No fue posible eliminar el visual del hero.')
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
      clearPublicContentCache();
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

  const handleOpenCreateServiceModal = () => {
    setServiceModal({
      isOpen: true,
      mode: 'create',
      service: initialServiceForm
    });
  };

  const handleOpenEditServiceModal = (service) => {
    setServiceModal({
      isOpen: true,
      mode: 'edit',
      service: {
        ...service,
        images: [...(service.images || [])]
      }
    });
  };

  const handleCloseServiceModal = () => {
    setServiceModal({
      isOpen: false,
      mode: 'create',
      service: initialServiceForm
    });
  };

  const handleCreateService = async (serviceForm) => {
    if (!serviceForm.title || !serviceForm.description) {
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
          ...serviceForm,
          price: Number(serviceForm.price || 0),
          durationMinutes: Number(serviceForm.durationMinutes || 60),
          orderIndex: Number(serviceForm.orderIndex || 0)
        },
        token
      );
      await refreshDashboard(token);
      clearPublicContentCache();
      handleCloseServiceModal();
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

  const handleSaveService = async (serviceId, serviceForm) => {
    if (!serviceId) {
      return;
    }

    setBusyAction(`service:${serviceId}`);
    setServiceStatus({ type: '', message: '' });

    try {
      const response = await updateService(
        serviceId,
        {
          ...serviceForm,
          price: Number(serviceForm.price || 0),
          durationMinutes: Number(serviceForm.durationMinutes || 60),
          orderIndex: Number(serviceForm.orderIndex || 0)
        },
        token
      );
      await refreshDashboard(token);
      clearPublicContentCache();
      handleCloseServiceModal();
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

  const handleSubmitServiceModal = async (serviceForm) => {
    if (serviceModal.mode === 'edit') {
      await handleSaveService(serviceModal.service.id, serviceForm);
      return;
    }

    await handleCreateService(serviceForm);
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
      clearPublicContentCache();
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
      clearPublicContentCache();
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
      clearPublicContentCache();
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
      clearPublicContentCache();
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

  const handlePreviousWeek = () => {
    setSelectedWeekStart((currentValue) => addDays(currentValue, -7));
  };

  const handleNextWeek = () => {
    setSelectedWeekStart((currentValue) => addDays(currentValue, 7));
  };

  const handleOpenAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseAppointmentModal = () => {
    setSelectedAppointment(null);
  };

  const todayDateKey = formatDateKey(new Date());
  const bookingSettingsMap = bookingSettings.reduce((accumulator, item) => {
    accumulator[item.dayOfWeek] = item;
    return accumulator;
  }, {});
  const appointmentsByDate = weeklyAppointments.reduce((accumulator, item) => {
    const dateKey = item.preferredDate;

    if (!accumulator[dateKey]) {
      accumulator[dateKey] = [];
    }

    accumulator[dateKey].push(item);
    return accumulator;
  }, {});
  const visibleWeekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(selectedWeekStart, index);
    const dateKey = formatDateKey(date);
    const appointments = appointmentsByDate[dateKey] || [];
    const schedule = bookingSettingsMap[date.getDay()] || null;

    return {
      date,
      dateKey,
      dayLabel: capitalizeText(weekDayFormatter.format(date)),
      dateLabel: capitalizeText(weekDayDateFormatter.format(date)),
      isToday: dateKey === todayDateKey,
      schedule,
      appointments,
      slotRows: buildDaySlotRows(schedule, appointments)
    };
  });
  const selectedAppointmentDate = selectedAppointment
    ? parseDateKey(selectedAppointment.preferredDate)
    : null;
  const activeTabMeta = adminTabs.find((tab) => tab.id === activeTab) || adminTabs[0];
  const enabledBookingDays = bookingSettings.filter((day) => day.isEnabled);
  const pendingTestimonialsCount = testimonials.filter((item) => item.status === 'pending').length;
  const adminPageCards = [
    {
      id: 'reservations',
      title: 'Agenda semanal',
      metric: `${dashboard?.appointments?.length || 0} reserva${
        (dashboard?.appointments?.length || 0) === 1 ? '' : 's'
      } reciente${(dashboard?.appointments?.length || 0) === 1 ? '' : 's'}`,
      description: 'Vista estilo agenda para revisar horarios tomados y abrir el detalle de cada paciente.'
    },
    {
      id: 'booking',
      title: 'Horarios activos',
      metric: `${enabledBookingDays.length} dia${enabledBookingDays.length === 1 ? '' : 's'} activo${enabledBookingDays.length === 1 ? '' : 's'}`,
      description: 'Configura bloques, apertura, cierre y dias disponibles para la reserva online.'
    },
    {
      id: 'services',
      title: 'Catalogo de servicios',
      metric: `${services.length} servicio${services.length === 1 ? '' : 's'}`,
      description: 'Administra fichas, imagenes y orden visual del contenido comercial.'
    },
    {
      id: 'testimonials',
      title: 'Testimonios',
      metric: `${pendingTestimonialsCount} pendiente${pendingTestimonialsCount === 1 ? '' : 's'}`,
      description: 'Controla aprobacion, visibilidad y actualizacion de comentarios del sitio.'
    }
  ];
  const pageWorkspaceTitle =
    activeTab === 'pages'
      ? pagesView === 'admin'
        ? 'Admin Pages'
        : 'Landing Pages'
      : activeTabMeta.label;

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
    <section className="admin-page admin-app-page">
      {isLoading ? <p className="status-note">Cargando datos del panel...</p> : null}
      {errorMessage ? <p className="form-status error">{errorMessage}</p> : null}

      {dashboard ? (
        <div className={`admin-app-shell ${isSidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}>
          <aside className="admin-app-rail">
            <div className="admin-app-rail-top">
              <div className="admin-app-rail-brand">LS</div>

              <button
                type="button"
                className="admin-app-rail-toggle"
                onClick={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
                aria-label={isSidebarCollapsed ? 'Expandir menu' : 'Minimizar menu'}
                title={isSidebarCollapsed ? 'Expandir menu' : 'Minimizar menu'}
              >
                {isSidebarCollapsed ? '\u203A' : '\u2039'}
              </button>
            </div>

            <div className="admin-app-rail-nav">
              {adminTabs.map((tab) => (
                <div key={tab.id} className="admin-app-rail-item">
                  <button
                    type="button"
                    className={`admin-app-rail-button ${activeTab === tab.id ? 'is-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    aria-label={tab.label}
                    title={tab.label}
                  >
                    <span className="admin-app-rail-button-icon">
                      <AdminTabIcon icon={tab.icon} />
                    </span>
                    <span className="admin-app-rail-button-label">{tab.label}</span>
                  </button>

                  {tab.id === 'pages' && activeTab === 'pages' && !isSidebarCollapsed ? (
                    <div className="admin-app-rail-subnav">
                      {adminPageViews.map((view) => (
                        <button
                          key={view.id}
                          type="button"
                          className={`admin-app-rail-subnav-button ${
                            pagesView === view.id ? 'is-active' : ''
                          }`}
                          onClick={() => setPagesView(view.id)}
                        >
                          {view.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </aside>

          <div className="admin-app-main">
            <div className="admin-app-main-header is-compact">
              <div>
                <span className="admin-app-kicker">Laguna Salud</span>
                <h1>{pageWorkspaceTitle}</h1>
              </div>
            </div>

            <div className="admin-content-stack">
              {activeTab === 'pages' && pagesView === 'admin' ? (
                <section className="admin-workspace">
                  <div className="admin-workspace-header">
                    <h2>Admin Pages</h2>
                    <p>
                      El panel abre aqui para que el equipo pueda entrar rapido a cada modulo interno
                      con una experiencia estilo app y lenguaje visual mas cercano a iOS.
                    </p>
                  </div>

                  <div className="admin-page-hub">
                    {adminPageCards.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="admin-page-hub-card"
                        onClick={() => setActiveTab(item.id)}
                      >
                        <span className="admin-app-kicker">{item.metric}</span>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeTab === 'pages' && pagesView === 'landing' ? (
              <section className="admin-workspace">
                <div className="admin-workspace-header">
                  <h2>Landing Pages</h2>
                  <p>
                    Edita los textos principales de inicio, sobre mi, servicios, comentarios,
                    contacto y reservar hora.
                  </p>
                </div>

                {pageStatus.message ? (
                  <p className={`form-status ${pageStatus.type}`}>{pageStatus.message}</p>
                ) : null}

                <article className="admin-editor-card admin-hero-visuals-card">
                  <div className="admin-card-header">
                    <div>
                      <strong>Visuales rotativos del inicio</strong>
                      <span>
                        Sube tres o mas imagenes para el hero. La home rota entre visuales y
                        composiciones cada vez que se vuelve al inicio.
                      </span>
                    </div>
                  </div>

                  {heroVisualStatus.message ? (
                    <p className={`form-status ${heroVisualStatus.type}`}>
                      {heroVisualStatus.message}
                    </p>
                  ) : null}

                  <div className="admin-hero-visual-create">
                    <div className="admin-hero-visual-preview">
                      {newHeroVisual.imageUrl ? (
                        <img src={newHeroVisual.imageUrl} alt="Vista previa del hero" />
                      ) : (
                        <div className="admin-hero-visual-empty">
                          <strong>Sin imagen cargada</strong>
                          <p>Sube una foto de la profesional para usarla en el hero rotativo.</p>
                        </div>
                      )}
                    </div>

                    <div className="field-grid admin-form-grid">
                      <label className="field">
                        <span>Nombre visual</span>
                        <input
                          type="text"
                          value={newHeroVisual.title}
                          onChange={(event) =>
                            handleNewHeroVisualFieldChange('title', event.target.value)
                          }
                          placeholder="Hero principal"
                        />
                      </label>

                      <label className="field">
                        <span>Orden</span>
                        <input
                          type="number"
                          min="0"
                          value={newHeroVisual.orderIndex}
                          onChange={(event) =>
                            handleNewHeroVisualFieldChange('orderIndex', event.target.value)
                          }
                        />
                      </label>

                      <label className="field admin-inline-field">
                        <span>Activo</span>
                        <input
                          type="checkbox"
                          checked={newHeroVisual.isActive}
                          onChange={(event) =>
                            handleNewHeroVisualFieldChange('isActive', event.target.checked)
                          }
                        />
                      </label>

                      <label className="field admin-form-span-2">
                        <span>Texto de apoyo</span>
                        <textarea
                          rows="3"
                          value={newHeroVisual.description}
                          onChange={(event) =>
                            handleNewHeroVisualFieldChange('description', event.target.value)
                          }
                          placeholder="Texto breve para reforzar la escena visual."
                        />
                      </label>

                      <div className="admin-form-span-2 admin-hero-visual-toolbar">
                        <label className="service-upload-button">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleHeroVisualUpload(event)}
                          />
                          Subir imagen
                        </label>

                        <button
                          type="button"
                          className="button button-primary"
                          disabled={busyAction === 'create-hero-visual'}
                          onClick={handleCreateHeroVisual}
                        >
                          {busyAction === 'create-hero-visual' ? 'Guardando...' : 'Agregar visual'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="admin-hero-visual-grid">
                    {heroVisuals.length ? (
                      heroVisuals.map((visual) => (
                        <article key={visual.id} className="admin-hero-visual-item">
                          <div className="admin-hero-visual-item-preview">
                            {visual.imageUrl ? (
                              <img src={visual.imageUrl} alt={visual.title || 'Visual del hero'} />
                            ) : (
                              <div className="admin-hero-visual-empty">
                                <strong>Sin imagen</strong>
                              </div>
                            )}
                          </div>

                          <div className="field-grid admin-form-grid">
                            <label className="field">
                              <span>Nombre visual</span>
                              <input
                                type="text"
                                value={visual.title}
                                onChange={(event) =>
                                  handleHeroVisualFieldChange(
                                    visual.id,
                                    'title',
                                    event.target.value
                                  )
                                }
                              />
                            </label>

                            <label className="field">
                              <span>Orden</span>
                              <input
                                type="number"
                                min="0"
                                value={visual.orderIndex}
                                onChange={(event) =>
                                  handleHeroVisualFieldChange(
                                    visual.id,
                                    'orderIndex',
                                    event.target.value
                                  )
                                }
                              />
                            </label>

                            <label className="field admin-inline-field">
                              <span>Activo</span>
                              <input
                                type="checkbox"
                                checked={visual.isActive}
                                onChange={(event) =>
                                  handleHeroVisualFieldChange(
                                    visual.id,
                                    'isActive',
                                    event.target.checked
                                  )
                                }
                              />
                            </label>

                            <label className="field admin-form-span-2">
                              <span>Texto de apoyo</span>
                              <textarea
                                rows="3"
                                value={visual.description}
                                onChange={(event) =>
                                  handleHeroVisualFieldChange(
                                    visual.id,
                                    'description',
                                    event.target.value
                                  )
                                }
                              />
                            </label>

                            <div className="admin-form-span-2 admin-hero-visual-toolbar">
                              <label className="service-upload-button">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) => handleHeroVisualUpload(event, visual.id)}
                                />
                                Cambiar imagen
                              </label>

                              <div className="admin-card-actions">
                                <button
                                  type="button"
                                  className="button button-secondary"
                                  disabled={busyAction === `hero-visual:${visual.id}`}
                                  onClick={() => handleSaveHeroVisual(visual.id)}
                                >
                                  {busyAction === `hero-visual:${visual.id}`
                                    ? 'Guardando...'
                                    : 'Guardar'}
                                </button>

                                <button
                                  type="button"
                                  className="button button-secondary"
                                  disabled={busyAction === `delete-hero-visual:${visual.id}`}
                                  onClick={() => handleDeleteHeroVisual(visual.id)}
                                >
                                  {busyAction === `delete-hero-visual:${visual.id}`
                                    ? 'Eliminando...'
                                    : 'Eliminar'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="service-images-empty admin-hero-visual-empty-state">
                        <strong>Aun no hay visuales para el hero</strong>
                        <p>
                          Agrega las primeras imagenes y la home empezara a rotar entre composiciones
                          limpias y minimalistas.
                        </p>
                      </div>
                    )}
                  </div>
                </article>

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

              {activeTab === 'reservations' ? (
              <section className="admin-workspace">
                <div className="booking-week-header">
                  <div>
                    <h2>Agenda semanal compacta</h2>
                    <p>
                      Cada dia se divide en bloques segun el horario configurado. Los bloques
                      tomados muestran el nombre del paciente y al presionarlos se abre el detalle
                      completo.
                    </p>
                  </div>

                  <div className="booking-week-navigation">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={handlePreviousWeek}
                    >
                      Semana anterior
                    </button>

                    <div className="booking-week-range">
                      <strong>{formatWeekRange(selectedWeekStart)}</strong>
                      <span>
                        {weeklyAppointments.length} reserva{weeklyAppointments.length === 1 ? '' : 's'} en
                        la semana
                      </span>
                    </div>

                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={handleNextWeek}
                    >
                      Semana siguiente
                    </button>
                  </div>
                </div>

                {appointmentsError ? <p className="form-status error">{appointmentsError}</p> : null}
                {isLoadingAppointments ? (
                  <p className="status-note">Cargando reservas de la semana...</p>
                ) : null}

                <div className="booking-week-board-shell">
                  <div className="booking-week-board">
                    {visibleWeekDays.map((day) => {
                      const isEnabled = Boolean(day.schedule?.isEnabled);
                      const dayStateLabel = day.appointments.length
                        ? `${day.appointments.length} reserva${day.appointments.length === 1 ? '' : 's'}`
                        : isEnabled
                          ? 'Sin reservas'
                          : 'Cerrado';

                      return (
                        <article
                          key={day.dateKey}
                          className={`booking-week-card ${day.isToday ? 'is-today' : ''} ${
                            !isEnabled ? 'is-closed' : ''
                          }`}
                        >
                          <div className="booking-week-card-head">
                            <div>
                              <span className="booking-week-day-name">{day.dayLabel}</span>
                              <strong>{day.dateLabel}</strong>
                            </div>

                            <span
                              className={`admin-state-pill ${
                                day.appointments.length
                                  ? 'is-info'
                                  : isEnabled
                                    ? 'is-new'
                                    : 'is-muted'
                              }`}
                            >
                              {dayStateLabel}
                            </span>
                          </div>

                          <div className="booking-week-card-meta">
                            {isEnabled ? (
                              <>
                                <span>
                                  {day.schedule.startTime} - {day.schedule.endTime}
                                </span>
                                <span>Bloques de {day.schedule.slotMinutes} min</span>
                              </>
                            ) : day.appointments.length ? (
                              <span>Dia cerrado actualmente, pero con reservas registradas.</span>
                            ) : (
                              <span>Dia no habilitado en la configuracion.</span>
                            )}
                          </div>

                          {day.slotRows.length ? (
                            <div className="booking-slot-list">
                              {day.slotRows.map((slot) =>
                                slot.appointment ? (
                                  <button
                                    key={`${day.dateKey}-${slot.time}`}
                                    type="button"
                                    className={`booking-slot-row is-booked ${getAppointmentStatusClassName(
                                      slot.appointment.status
                                    )}`}
                                    onClick={() => handleOpenAppointmentModal(slot.appointment)}
                                  >
                                    <span className="booking-slot-time">
                                      {slot.appointment.preferredTime}
                                    </span>
                                    <span className="booking-slot-status">Reservado</span>
                                  </button>
                                ) : (
                                  <div
                                    key={`${day.dateKey}-${slot.time}`}
                                    className="booking-slot-row is-free"
                                  >
                                    <span className="booking-slot-time">{slot.time}</span>
                                    <span className="booking-slot-status">Sin reserva</span>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="booking-week-empty">
                              {isEnabled
                                ? 'No hay bloques visibles para este dia.'
                                : 'Este dia no tiene horario activo ni reservas cargadas.'}
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
              ) : null}

              {activeTab === 'booking' ? (
              <section className="admin-workspace">
                <div className="booking-config-header">
                  <div>
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
                  <h2>CRUD de servicios</h2>
                  <p>
                    Gestiona el catalogo desde una tabla y abre el detalle en un modal para crear o
                    editar cada servicio.
                  </p>
                </div>

                {serviceStatus.message ? (
                  <p className={`form-status ${serviceStatus.type}`}>{serviceStatus.message}</p>
                ) : null}

                <div className="admin-table-toolbar">
                  <div className="admin-table-note">
                    <span className="flow-label">Catalogo</span>
                    <strong>{services.length} servicios cargados</strong>
                  </div>

                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleOpenCreateServiceModal}
                  >
                    Nuevo servicio
                  </button>
                </div>

                <div className="admin-table-shell">
                  <table className="admin-table services-admin-table">
                    <thead>
                      <tr>
                        <th>Servicio</th>
                        <th>Precio</th>
                        <th>Duracion</th>
                        <th>Imagenes</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr key={service.id}>
                          <td>
                            <div className="service-table-main">
                              {service.images?.[0] ? (
                                <img
                                  src={service.images[0]}
                                  alt={service.title}
                                  className="service-row-thumbnail"
                                />
                              ) : (
                                <div className="service-row-thumbnail is-empty">LS</div>
                              )}

                              <div>
                                <strong>{service.title}</strong>
                                <span>ID {service.id}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            {service.currency} {Number(service.price || 0).toLocaleString('es-CL')}
                          </td>
                          <td>{service.durationMinutes} min</td>
                          <td>{service.images?.length || 0} / 10</td>
                          <td>
                            <span
                              className={`admin-state-pill ${service.isActive ? 'is-active' : 'is-muted'}`}
                            >
                              {service.isActive ? 'Activo' : 'Oculto'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              <button
                                type="button"
                                className="button button-secondary admin-table-button"
                                onClick={() => handleOpenEditServiceModal(service)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="button button-secondary admin-table-button"
                                disabled={busyAction === `delete-service:${service.id}`}
                                onClick={() => handleDeleteService(service.id)}
                              >
                                {busyAction === `delete-service:${service.id}` ? 'Eliminando...' : 'Eliminar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ServiceEditorModal
                  isOpen={serviceModal.isOpen}
                  mode={serviceModal.mode}
                  service={serviceModal.service}
                  durationOptions={durationOptions}
                  isSubmitting={
                    busyAction === 'create-service' ||
                    busyAction === `service:${serviceModal.service?.id || ''}`
                  }
                  onClose={handleCloseServiceModal}
                  onSubmit={handleSubmitServiceModal}
                />
              </section>
              ) : null}

              {activeTab === 'testimonials' ? (
              <section className="admin-workspace">
                <div className="admin-workspace-header">
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
        </div>
      ) : null}

      <AppModal
        isOpen={Boolean(selectedAppointment)}
        onClose={handleCloseAppointmentModal}
        title={selectedAppointment?.fullName || 'Detalle de reserva'}
        subtitle={
          selectedAppointment && selectedAppointmentDate
            ? `${capitalizeText(appointmentDateFormatter.format(selectedAppointmentDate))} · ${
                selectedAppointment.preferredTime
              }${selectedAppointment.endTime ? ` - ${selectedAppointment.endTime}` : ''}`
            : ''
        }
        footer={
          <button type="button" className="button button-primary" onClick={handleCloseAppointmentModal}>
            Cerrar
          </button>
        }
      >
        {selectedAppointment ? (
          <div className="appointment-modal-details">
            <div className="appointment-modal-grid">
              <article className="appointment-modal-card">
                <span>Estado</span>
                <strong>{appointmentStatusLabels[selectedAppointment.status] || selectedAppointment.status}</strong>
              </article>

              <article className="appointment-modal-card">
                <span>Servicio</span>
                <strong>{selectedAppointment.serviceName || 'Atencion general'}</strong>
              </article>

              <article className="appointment-modal-card">
                <span>Correo</span>
                <strong>{selectedAppointment.email}</strong>
              </article>

              <article className="appointment-modal-card">
                <span>Telefono</span>
                <strong>{selectedAppointment.phone || 'No informado'}</strong>
              </article>
            </div>

            <article className="appointment-modal-panel">
              <span>Observaciones</span>
              <p>{selectedAppointment.notes || 'Esta reserva no tiene observaciones.'}</p>
            </article>
          </div>
        ) : null}
      </AppModal>
    </section>
  );
}
