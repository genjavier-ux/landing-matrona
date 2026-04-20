import { pool } from '../config/db.js';
import { addMinutesToTime, getAvailabilityForDate } from '../utils/availability.js';
import { fetchServicesWithImages } from '../utils/services.js';

export const getPublicContent = async (_req, res) => {
  const [sections] = await pool.query('SELECT `key`, title, content FROM site_sections');
  const services = await fetchServicesWithImages({ onlyActive: true });
  const [testimonials] = await pool.query(
    `
      SELECT
        id,
        patient_name_alias AS patientNameAlias,
        content,
        rating
      FROM testimonials
      WHERE status = 'approved'
        AND is_visible = 1
      ORDER BY id DESC
      LIMIT 8
    `
  );
  const [gallery] = await pool.query(
    `
      SELECT
        id,
        title,
        description,
        image_url AS imageUrl
      FROM gallery_items
      WHERE is_active = 1
      ORDER BY order_index, id
    `
  );
  const [socialLinks] = await pool.query(
    'SELECT id, platform, url FROM social_links WHERE is_active = 1'
  );
  const [weeklyAvailability] = await pool.query(
    `
      SELECT
        id,
        day_of_week AS dayOfWeek,
        is_enabled AS isEnabled,
        start_time AS startTime,
        end_time AS endTime,
        slot_minutes AS slotMinutes
      FROM weekly_availability
      WHERE is_enabled = 1
      ORDER BY day_of_week
    `
  );

  const hero = sections.find((item) => item.key === 'hero') || {
    title: 'Matrona Contigo',
    content: 'Cuidado integral y cercano.'
  };
  const sectionsByKey = Object.fromEntries(
    sections.map((item) => [
      item.key,
      {
        key: item.key,
        title: item.title,
        content: item.content
      }
    ])
  );

  return res.json({
    hero: { title: hero.title, description: hero.content },
    sections: sectionsByKey,
    services,
    testimonials,
    gallery,
    socialLinks,
    weeklyAvailability
  });
};

export const getPublicAvailability = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'La fecha es requerida.' });
  }

  const availability = await getAvailabilityForDate(date);

  if (!availability.isValidDate) {
    return res.status(400).json({ message: 'La fecha no tiene un formato valido.' });
  }

  return res.json(availability);
};

export const createContact = async (req, res) => {
  const { name, email, phone, message } = req.body;
  await pool.query('INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)', [
    name,
    email,
    phone || null,
    message
  ]);
  return res.status(201).json({ message: 'Solicitud recibida.' });
};

export const createAppointment = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    preferredDate,
    preferredTime,
    serviceId,
    serviceName,
    notes
  } = req.body;

  if (!fullName || !email || !preferredDate || !preferredTime) {
    return res.status(400).json({ message: 'Completa nombre, correo, fecha y hora.' });
  }

  const availability = await getAvailabilityForDate(preferredDate);

  if (!availability.isValidDate) {
    return res.status(400).json({ message: 'La fecha no tiene un formato valido.' });
  }

  const requestedSlot = availability.slots.find((slot) => slot.time === preferredTime);

  if (!requestedSlot) {
    return res.status(400).json({ message: 'La hora seleccionada ya no esta disponible.' });
  }

  let selectedServiceId = serviceId || null;
  let selectedServiceName = serviceName || null;

  if (selectedServiceId) {
    const [serviceRows] = await pool.query(
      `
        SELECT id, title
        FROM services
        WHERE id = ?
          AND is_active = 1
        LIMIT 1
      `,
      [selectedServiceId]
    );

    const service = serviceRows[0];
    if (!service) {
      return res.status(400).json({ message: 'El servicio seleccionado no esta disponible.' });
    }

    selectedServiceId = service.id;
    selectedServiceName = service.title;
  } else if (selectedServiceName) {
    const [serviceRows] = await pool.query(
      `
        SELECT id, title
        FROM services
        WHERE title = ?
          AND is_active = 1
        LIMIT 1
      `,
      [selectedServiceName]
    );

    if (serviceRows[0]) {
      selectedServiceId = serviceRows[0].id;
      selectedServiceName = serviceRows[0].title;
    }
  }

  const endTime = addMinutesToTime(preferredTime, availability.slotMinutes);

  await pool.query(
    `
      INSERT INTO appointments (
        full_name,
        email,
        phone,
        service_id,
        service_name,
        preferred_date,
        preferred_time,
        end_time,
        slot_minutes,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      fullName,
      email,
      phone || null,
      selectedServiceId,
      selectedServiceName,
      preferredDate,
      preferredTime,
      endTime,
      availability.slotMinutes,
      notes || null
    ]
  );

  return res.status(201).json({
    message: 'Reserva enviada correctamente.',
    appointment: {
      fullName,
      preferredDate,
      preferredTime,
      endTime
    }
  });
};

export const createSubscription = async (req, res) => {
  const { email } = req.body;
  await pool.query('INSERT IGNORE INTO subscribers (email, source) VALUES (?, ?)', [
    email,
    'landing'
  ]);
  return res.status(201).json({ message: 'Suscripcion guardada.' });
};

export const createTestimonial = async (req, res) => {
  const { patientNameAlias, content, reviewCode, rating } = req.body;

  if (!patientNameAlias || !content || !reviewCode) {
    return res.status(400).json({ message: 'Completa alias, comentario y codigo.' });
  }

  const safeRating = Number(rating || 5);
  if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
    return res.status(400).json({ message: 'La puntuacion debe estar entre 1 y 5 estrellas.' });
  }

  const [codes] = await pool.query(
    'SELECT id, is_used, expires_at FROM review_codes WHERE code = ? LIMIT 1',
    [reviewCode]
  );

  const code = codes[0];
  if (!code || code.is_used) {
    return res.status(400).json({ message: 'Codigo invalido o usado.' });
  }

  if (code.expires_at && new Date(code.expires_at) < new Date()) {
    return res.status(400).json({ message: 'Codigo expirado.' });
  }

  await pool.query(
    `
      INSERT INTO testimonials (patient_name_alias, content, rating, status, is_visible)
      VALUES (?, ?, ?, 'pending', 1)
    `,
    [patientNameAlias, content, safeRating]
  );

  await pool.query('UPDATE review_codes SET is_used = 1 WHERE id = ?', [code.id]);

  return res.status(201).json({ message: 'Comentario enviado a moderacion.' });
};
