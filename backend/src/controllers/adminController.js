import { pool } from '../config/db.js';

export const getDashboard = async (_req, res) => {
  const [sections] = await pool.query(
    'SELECT id, `key`, title, content FROM site_sections ORDER BY id'
  );
  const [services] = await pool.query(
    `
      SELECT
        id,
        title,
        description,
        price,
        currency,
        duration_minutes AS durationMinutes,
        image_url AS imageUrl,
        is_active AS isActive,
        order_index AS orderIndex
      FROM services
      ORDER BY order_index, id
    `
  );
  const [testimonials] = await pool.query(
    `
      SELECT
        id,
        patient_name_alias AS patientNameAlias,
        content,
        rating,
        is_visible AS isVisible,
        status,
        created_at AS createdAt
      FROM testimonials
      ORDER BY created_at DESC
    `
  );
  const [gallery] = await pool.query(
    `
      SELECT
        id,
        title,
        description,
        image_url AS imageUrl,
        is_active AS isActive,
        order_index AS orderIndex
      FROM gallery_items
      ORDER BY order_index, id
    `
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
      ORDER BY day_of_week
    `
  );
  const [appointments] = await pool.query(
    `
      SELECT
        id,
        full_name AS fullName,
        email,
        phone,
        service_id AS serviceId,
        service_name AS serviceName,
        preferred_date AS preferredDate,
        preferred_time AS preferredTime,
        end_time AS endTime,
        slot_minutes AS slotMinutes,
        notes,
        status,
        created_at AS createdAt
      FROM appointments
      ORDER BY preferred_date DESC, preferred_time DESC
      LIMIT 30
    `
  );
  const [reviewCodes] = await pool.query(
    `
      SELECT
        id,
        code,
        is_used AS isUsed,
        expires_at AS expiresAt,
        created_at AS createdAt
      FROM review_codes
      ORDER BY created_at DESC
      LIMIT 12
    `
  );

  return res.json({
    sections,
    services,
    testimonials,
    gallery,
    weeklyAvailability,
    appointments,
    reviewCodes
  });
};

export const updateSection = async (req, res) => {
  const { key } = req.params;
  const { title, content } = req.body;

  await pool.query(
    `
      INSERT INTO site_sections (\`key\`, title, content)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        content = VALUES(content)
    `,
    [key, title, content]
  );

  return res.json({ message: 'Seccion actualizada.' });
};

export const createService = async (req, res) => {
  const {
    title,
    description,
    imageUrl,
    price,
    currency,
    durationMinutes,
    isActive,
    orderIndex
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'El servicio debe tener titulo y descripcion.' });
  }

  const [[{ nextOrderIndex }]] = await pool.query(
    'SELECT COALESCE(MAX(order_index), 0) + 1 AS nextOrderIndex FROM services'
  );

  const [result] = await pool.query(
    `
      INSERT INTO services (
        title,
        description,
        price,
        currency,
        duration_minutes,
        image_url,
        is_active,
        order_index
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      title,
      description,
      Number(price || 0),
      currency || 'CLP',
      Number(durationMinutes || 60),
      imageUrl || null,
      isActive === undefined ? 1 : Number(Boolean(isActive)),
      Number(orderIndex || nextOrderIndex)
    ]
  );

  return res.status(201).json({
    id: result.insertId,
    message: 'Servicio creado.'
  });
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    imageUrl,
    price,
    currency,
    durationMinutes,
    isActive,
    orderIndex
  } = req.body;

  await pool.query(
    `
      UPDATE services
      SET
        title = ?,
        description = ?,
        price = ?,
        currency = ?,
        duration_minutes = ?,
        image_url = ?,
        is_active = ?,
        order_index = ?
      WHERE id = ?
    `,
    [
      title,
      description,
      Number(price || 0),
      currency || 'CLP',
      Number(durationMinutes || 60),
      imageUrl || null,
      Number(Boolean(isActive)),
      Number(orderIndex || 0),
      id
    ]
  );

  return res.json({ message: 'Servicio actualizado.' });
};

export const deleteService = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM services WHERE id = ?', [id]);
  return res.json({ message: 'Servicio eliminado.' });
};

export const createGalleryItem = async (req, res) => {
  const { title, description, imageUrl, isActive, orderIndex } = req.body;

  if (!title || !imageUrl) {
    return res.status(400).json({ message: 'La galeria requiere titulo e imagen.' });
  }

  const [[{ nextOrderIndex }]] = await pool.query(
    'SELECT COALESCE(MAX(order_index), 0) + 1 AS nextOrderIndex FROM gallery_items'
  );

  const [result] = await pool.query(
    `
      INSERT INTO gallery_items (title, description, image_url, is_active, order_index)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      title,
      description || null,
      imageUrl,
      isActive === undefined ? 1 : Number(Boolean(isActive)),
      Number(orderIndex || nextOrderIndex)
    ]
  );

  return res.status(201).json({
    id: result.insertId,
    message: 'Elemento de galeria creado.'
  });
};

export const updateGalleryItem = async (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl, isActive, orderIndex } = req.body;

  await pool.query(
    `
      UPDATE gallery_items
      SET
        title = ?,
        description = ?,
        image_url = ?,
        is_active = ?,
        order_index = ?
      WHERE id = ?
    `,
    [title, description || null, imageUrl, Number(Boolean(isActive)), Number(orderIndex || 0), id]
  );

  return res.json({ message: 'Elemento de galeria actualizado.' });
};

export const deleteGalleryItem = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM gallery_items WHERE id = ?', [id]);
  return res.json({ message: 'Elemento de galeria eliminado.' });
};

export const getWeeklyAvailability = async (_req, res) => {
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
      ORDER BY day_of_week
    `
  );

  return res.json(rows);
};

export const upsertWeeklyAvailability = async (req, res) => {
  const { availability } = req.body;

  if (!Array.isArray(availability) || !availability.length) {
    return res.status(400).json({ message: 'Debes enviar una lista de disponibilidad.' });
  }

  for (const item of availability) {
    const { dayOfWeek, isEnabled, startTime, endTime, slotMinutes } = item;

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ message: 'dayOfWeek debe estar entre 0 y 6.' });
    }

    await pool.query(
      `
        INSERT INTO weekly_availability (
          day_of_week,
          is_enabled,
          start_time,
          end_time,
          slot_minutes
        )
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          is_enabled = VALUES(is_enabled),
          start_time = VALUES(start_time),
          end_time = VALUES(end_time),
          slot_minutes = VALUES(slot_minutes)
      `,
      [
        dayOfWeek,
        Number(Boolean(isEnabled)),
        isEnabled ? startTime : null,
        isEnabled ? endTime : null,
        Number(slotMinutes || 60)
      ]
    );
  }

  return res.json({ message: 'Disponibilidad semanal actualizada.' });
};

export const getAppointments = async (_req, res) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        full_name AS fullName,
        email,
        phone,
        service_id AS serviceId,
        service_name AS serviceName,
        preferred_date AS preferredDate,
        preferred_time AS preferredTime,
        end_time AS endTime,
        slot_minutes AS slotMinutes,
        notes,
        status,
        created_at AS createdAt
      FROM appointments
      ORDER BY preferred_date DESC, preferred_time DESC
    `
  );

  return res.json(rows);
};

export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['new', 'confirmed', 'completed', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Estado de reserva no valido.' });
  }

  await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  return res.json({ message: 'Estado de la reserva actualizado.' });
};

export const createAdminTestimonial = async (req, res) => {
  const { patientNameAlias, content, rating, status, isVisible } = req.body;

  if (!patientNameAlias || !content) {
    return res.status(400).json({ message: 'El comentario requiere alias y contenido.' });
  }

  const safeRating = Number(rating || 5);
  const safeStatus = ['pending', 'approved', 'rejected'].includes(status) ? status : 'approved';

  if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
    return res.status(400).json({ message: 'La puntuacion debe estar entre 1 y 5 estrellas.' });
  }

  const [result] = await pool.query(
    `
      INSERT INTO testimonials (patient_name_alias, content, rating, is_visible, status)
      VALUES (?, ?, ?, ?, ?)
    `,
    [patientNameAlias, content, safeRating, Number(Boolean(isVisible ?? true)), safeStatus]
  );

  return res.status(201).json({
    id: result.insertId,
    message: 'Comentario creado.'
  });
};

export const updateAdminTestimonial = async (req, res) => {
  const { id } = req.params;
  const { patientNameAlias, content, rating, status, isVisible } = req.body;

  if (!patientNameAlias || !content) {
    return res.status(400).json({ message: 'El comentario requiere alias y contenido.' });
  }

  const safeRating = Number(rating || 5);
  const safeStatus = ['pending', 'approved', 'rejected'].includes(status) ? status : 'pending';

  if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
    return res.status(400).json({ message: 'La puntuacion debe estar entre 1 y 5 estrellas.' });
  }

  await pool.query(
    `
      UPDATE testimonials
      SET
        patient_name_alias = ?,
        content = ?,
        rating = ?,
        is_visible = ?,
        status = ?
      WHERE id = ?
    `,
    [patientNameAlias, content, safeRating, Number(Boolean(isVisible)), safeStatus, id]
  );

  return res.json({ message: 'Comentario actualizado.' });
};

export const deleteTestimonial = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
  return res.json({ message: 'Comentario eliminado.' });
};

export const approveTestimonial = async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE testimonials SET status = 'approved' WHERE id = ?", [id]);
  return res.json({ message: 'Comentario aprobado.' });
};

export const updateTestimonialVisibility = async (req, res) => {
  const { id } = req.params;
  const { isVisible } = req.body;

  await pool.query('UPDATE testimonials SET is_visible = ? WHERE id = ?', [
    Number(Boolean(isVisible)),
    id
  ]);

  return res.json({ message: 'Visibilidad del comentario actualizada.' });
};

export const generateReviewCode = async (req, res) => {
  const { code, expiresAt } = req.body;
  await pool.query('INSERT INTO review_codes (code, expires_at) VALUES (?, ?)', [
    code,
    expiresAt || null
  ]);
  return res.status(201).json({ message: 'Codigo creado.' });
};
