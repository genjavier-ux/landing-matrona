import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookingCalendar from '../components/BookingCalendar';
import usePublicContent from '../hooks/usePublicContent';
import { createAppointment, fetchAvailabilityByDate } from '../services/api';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  preferredDate: '',
  preferredTime: '',
  serviceId: '',
  serviceName: '',
  notes: ''
};

const createWeeklyAvailabilityMap = (rows = []) =>
  (rows || []).reduce((accumulator, item) => {
    accumulator[Number(item.dayOfWeek)] = {
      dayOfWeek: Number(item.dayOfWeek),
      isEnabled: Boolean(item.isEnabled),
      startTime: item.startTime || null,
      endTime: item.endTime || null,
      slotMinutes: Number(item.slotMinutes || 60)
    };
    return accumulator;
  }, {});

export default function BookingPage() {
  const { content } = usePublicContent();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [weeklyAvailability, setWeeklyAvailability] = useState({});
  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [status, setStatus] = useState({
    type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    setWeeklyAvailability(createWeeklyAvailabilityMap(content.weeklyAvailability));
  }, [content.weeklyAvailability]);

  const services = content.services || [];
  const requestedServiceId = searchParams.get('service');

  useEffect(() => {
    if (!requestedServiceId || !services.length) {
      return;
    }

    const selectedService = services.find((service) => String(service.id) === requestedServiceId);
    if (!selectedService) {
      return;
    }

    setForm((currentValue) => {
      if (
        currentValue.serviceId === String(selectedService.id) &&
        currentValue.serviceName === selectedService.title
      ) {
        return currentValue;
      }

      return {
        ...currentValue,
        serviceId: String(selectedService.id),
        serviceName: selectedService.title
      };
    });
  }, [requestedServiceId, services]);

  useEffect(() => {
    if (!form.preferredDate) {
      setIsLoadingSlots(false);
      return;
    }

    let isMounted = true;

    const loadAvailability = async () => {
      if (availabilityByDate[form.preferredDate]) {
        return;
      }

      setIsLoadingSlots(true);

      try {
        const response = await fetchAvailabilityByDate(form.preferredDate);

        if (!isMounted) {
          return;
        }

        setAvailabilityByDate((currentValue) => ({
          ...currentValue,
          [form.preferredDate]: {
            isEnabled: Boolean(response.isEnabled),
            slots: (response.slots || []).map((slot) => slot.time)
          }
        }));
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setAvailabilityByDate((currentValue) => ({
          ...currentValue,
          [form.preferredDate]: {
            isEnabled: false,
            slots: []
          }
        }));
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    };

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [availabilityByDate, form.preferredDate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentValue) => ({
      ...currentValue,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.preferredDate || !form.preferredTime) {
      setStatus({
        type: 'error',
        message: 'Selecciona una fecha y una hora en el calendario.'
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({
      type: '',
      message: ''
    });

    try {
      const response = await createAppointment({
        ...form,
        serviceId: form.serviceId ? Number(form.serviceId) : null
      });
      const selectedService = services.find((service) => String(service.id) === requestedServiceId);
      setStatus({
        type: 'success',
        message: response.message || 'Reserva enviada correctamente.'
      });
      setForm(
        selectedService
          ? {
              ...initialForm,
              serviceId: String(selectedService.id),
              serviceName: selectedService.title
            }
          : initialForm
      );
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'No fue posible enviar la reserva.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (value) => {
    setForm((currentValue) => ({
      ...currentValue,
      preferredDate: value,
      preferredTime: ''
    }));
  };

  const handleTimeChange = (value) => {
    setForm((currentValue) => ({
      ...currentValue,
      preferredTime: value
    }));
  };

  const handleServiceChange = (event) => {
    const { value } = event.target;
    const selectedService = services.find((service) => String(service.id) === value);

    setForm((currentValue) => ({
      ...currentValue,
      serviceId: value,
      serviceName: selectedService?.title || ''
    }));
  };

  const getAvailableSlots = (date) => {
    const dateKey = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
    const cachedAvailability = availabilityByDate[dateKey];

    if (cachedAvailability) {
      return cachedAvailability.slots;
    }
    return [];
  };

  const hasAvailableDay = (date) => {
    const dateKey = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
    const cachedAvailability = availabilityByDate[dateKey];

    if (cachedAvailability) {
      return cachedAvailability.slots.length > 0;
    }

    return Boolean(weeklyAvailability[date.getDay()]?.isEnabled);
  };

  const isSubmitDisabled =
    isSubmitting || !form.fullName || !form.email || !form.preferredDate || !form.preferredTime;
  const bookingSection = content.sections.booking;

  return (
    <section className="form-page booking-page">
      <form className="form-layout booking-layout booking-form-shell" onSubmit={handleSubmit}>
        <div className="booking-side">
          <div className="form-intro">
            <span className="section-tag">Reservar hora</span>
            <h1>{bookingSection.title}</h1>
            <p>{bookingSection.content}</p>

            <div className="list-card form-note booking-note">
              <strong>Agenda visual</strong>
              <p>
                El calendario ya alimenta la reserva y deja lista la integracion con la
                disponibilidad que configurara el administrador.
              </p>
            </div>
          </div>

          <div className="booking-selection-summary">
            <div className="booking-summary-pill">
              <span>Fecha</span>
              <strong>{form.preferredDate || 'Selecciona un dia'}</strong>
            </div>
            <div className="booking-summary-pill">
              <span>Hora</span>
              <strong>{form.preferredTime || 'Selecciona una hora'}</strong>
            </div>
          </div>

          <label className="field booking-notes-field">
            <span>Observaciones</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Cuentanos brevemente que necesitas"
              rows="4"
            />
          </label>

          {status.message ? <p className={`form-status ${status.type}`}>{status.message}</p> : null}

          <button
            type="submit"
            className="button button-primary submit-button booking-submit"
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar reserva'}
          </button>
        </div>

        <div className="booking-main">
          <BookingCalendar
            selectedDate={form.preferredDate}
            selectedTime={form.preferredTime}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            getAvailableSlots={getAvailableSlots}
            hasAvailableDay={hasAvailableDay}
            isLoadingSlots={isLoadingSlots}
          />

          <div className="field-grid">
            <label className="field">
              <span>Nombre completo</span>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </label>

            <label className="field">
              <span>Correo</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nombre@correo.com"
                required
              />
            </label>

            <label className="field">
              <span>Telefono</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+56 9 ..."
              />
            </label>

            <label className="field">
              <span>Servicio</span>
              <select name="serviceId" value={form.serviceId} onChange={handleServiceChange}>
                <option value="">Selecciona una opcion</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </form>
    </section>
  );
}
