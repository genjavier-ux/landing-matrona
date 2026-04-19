import { useEffect, useMemo, useState } from 'react';

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric'
});

const selectedDayFormatter = new Intl.DateTimeFormat('es-CL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

const startOfDay = (date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const isSameDay = (leftDate, rightDate) =>
  leftDate.getFullYear() === rightDate.getFullYear() &&
  leftDate.getMonth() === rightDate.getMonth() &&
  leftDate.getDate() === rightDate.getDate();

const createCalendarDays = (viewDate) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthStartOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - monthStartOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
};

export default function BookingCalendar({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  getAvailableSlots,
  hasAvailableDay,
  isLoadingSlots
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const parsedSelectedDate = useMemo(
    () => (selectedDate ? parseDateKey(selectedDate) : null),
    [selectedDate]
  );
  const [viewDate, setViewDate] = useState(parsedSelectedDate || today);

  useEffect(() => {
    if (parsedSelectedDate) {
      setViewDate(parsedSelectedDate);
    }
  }, [parsedSelectedDate]);

  const calendarDays = useMemo(() => createCalendarDays(viewDate), [viewDate]);
  const availableSlots = parsedSelectedDate ? getAvailableSlots(parsedSelectedDate) : [];

  const handlePreviousMonth = () => {
    setViewDate((currentValue) => new Date(currentValue.getFullYear(), currentValue.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((currentValue) => new Date(currentValue.getFullYear(), currentValue.getMonth() + 1, 1));
  };

  return (
    <div className="booking-calendar-stack">
      <div className="booking-calendar-card">
        <div className="booking-calendar-surface">
          <div className="booking-calendar-header">
            <div>
              <h2>{monthFormatter.format(viewDate)}</h2>
              <span className="booking-calendar-accent" />
            </div>

            <div className="booking-calendar-nav">
              <button type="button" className="calendar-nav-button" onClick={handlePreviousMonth}>
                &#8249;
              </button>
              <button type="button" className="calendar-nav-button" onClick={handleNextMonth}>
                &#8250;
              </button>
            </div>
          </div>

          <div className="booking-weekdays">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="booking-days-grid">
            {calendarDays.map((date) => {
              const isCurrentMonth = date.getMonth() === viewDate.getMonth();
              const isPast = startOfDay(date) < today;
              const isAvailable = isCurrentMonth && !isPast && hasAvailableDay(date);
              const isSelected = parsedSelectedDate ? isSameDay(date, parsedSelectedDate) : false;

              return (
                <button
                  key={toDateKey(date)}
                  type="button"
                  className={`calendar-day ${!isCurrentMonth ? 'is-muted' : ''} ${
                    isSelected ? 'is-selected' : ''
                  }`}
                  disabled={!isAvailable}
                  onClick={() => onDateChange(toDateKey(date))}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="booking-slots-card">
        <div className="booking-slots-header">
          <div>
            <span className="booking-slots-kicker">Horas disponibles</span>
            <h3>
              {parsedSelectedDate
                ? selectedDayFormatter.format(parsedSelectedDate)
                : 'Selecciona un dia en el calendario'}
            </h3>
          </div>

          {selectedTime ? <span className="booking-slot-badge">{selectedTime}</span> : null}
        </div>

        {availableSlots.length ? (
          <div className="booking-slots-grid">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`booking-slot ${selectedTime === slot ? 'is-selected' : ''}`}
                onClick={() => onTimeChange(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        ) : (
          <p className="booking-empty-state">
            {parsedSelectedDate && isLoadingSlots
              ? 'Cargando horarios disponibles...'
              : 'Elige un dia disponible para mostrar las horas de atencion.'}
          </p>
        )}
      </div>
    </div>
  );
}
