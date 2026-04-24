import { pool } from '../config/db.js';

const activeAppointmentStatuses = ['new', 'confirmed'];

const parseDateString = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

export const parseTimeToMinutes = (value) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatMinutesToTime = (value) => {
  const hours = `${Math.floor(value / 60)}`.padStart(2, '0');
  const minutes = `${value % 60}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const addMinutesToTime = (timeValue, minutesToAdd) =>
  formatMinutesToTime(parseTimeToMinutes(timeValue) + minutesToAdd);

export const buildTimeSlots = ({ startTime, endTime, slotMinutes }) => {
  if (!startTime || !endTime || !slotMinutes) {
    return [];
  }

  const startMinutes = parseTimeToMinutes(startTime.slice(0, 5));
  const endMinutes = parseTimeToMinutes(endTime.slice(0, 5));
  const slots = [];

  for (
    let currentMinutes = startMinutes;
    currentMinutes + slotMinutes <= endMinutes;
    currentMinutes += slotMinutes
  ) {
    slots.push(formatMinutesToTime(currentMinutes));
  }

  return slots;
};

export const getAvailabilityForDate = async (dateValue) => {
  const parsedDate = parseDateString(dateValue);

  if (!parsedDate) {
    return {
      isValidDate: false,
      date: dateValue,
      slots: []
    };
  }

  const dayOfWeek = parsedDate.getDay();
  const [rows] = await pool.query(
    `
      SELECT
        id,
        day_of_week AS dayOfWeek,
        is_enabled AS isEnabled,
        start_time AS startTime,
        end_time AS endTime,
        slot_minutes AS slotMinutes
      FROM weekly_availability
      WHERE day_of_week = ?
      LIMIT 1
    `,
    [dayOfWeek]
  );

  const schedule = rows[0];

  if (!schedule || !schedule.isEnabled || !schedule.startTime || !schedule.endTime) {
    return {
      isValidDate: true,
      date: dateValue,
      dayOfWeek,
      isEnabled: false,
      startTime: null,
      endTime: null,
      slotMinutes: null,
      slots: []
    };
  }

  const [appointments] = await pool.query(
    `
      SELECT preferred_time AS preferredTime
      FROM appointments
      WHERE preferred_date = ?
        AND status IN (?, ?)
    `,
    [dateValue, ...activeAppointmentStatuses]
  );

  const occupiedTimes = new Set(
    appointments.map((appointment) => String(appointment.preferredTime).slice(0, 5))
  );

  const allSlots = buildTimeSlots(schedule);
  const availableSlots = allSlots.filter((slot) => !occupiedTimes.has(slot));

  return {
    isValidDate: true,
    date: dateValue,
    dayOfWeek,
    isEnabled: Boolean(schedule.isEnabled),
    startTime: String(schedule.startTime).slice(0, 5),
    endTime: String(schedule.endTime).slice(0, 5),
    slotMinutes: schedule.slotMinutes,
    slots: availableSlots.map((slot) => ({
      time: slot,
      label: slot
    }))
  };
};
