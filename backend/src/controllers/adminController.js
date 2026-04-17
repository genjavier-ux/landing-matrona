import { pool } from '../config/db.js';

export const getDashboard = async (_req, res) => {
  const [sections] = await pool.query(
    'SELECT id, `key`, title, content FROM site_sections ORDER BY id'
  );
  const [services] = await pool.query(
    'SELECT id, title, description, image_url AS imageUrl, is_active AS isActive, order_index AS orderIndex FROM services ORDER BY order_index, id'
  );
  const [testimonials] = await pool.query(
    'SELECT id, patient_name_alias AS patientNameAlias, content, status, created_at AS createdAt FROM testimonials ORDER BY created_at DESC'
  );
  const [reviewCodes] = await pool.query(
    'SELECT id, code, is_used AS isUsed, expires_at AS expiresAt, created_at AS createdAt FROM review_codes ORDER BY created_at DESC LIMIT 12'
  );

  return res.json({
    sections,
    services,
    testimonials,
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
  const { title, description, imageUrl } = req.body;

  const [[{ nextOrderIndex }]] = await pool.query(
    'SELECT COALESCE(MAX(order_index), 0) + 1 AS nextOrderIndex FROM services'
  );

  const [result] = await pool.query(
    `
      INSERT INTO services (title, description, image_url, order_index)
      VALUES (?, ?, ?, ?)
    `,
    [title, description, imageUrl || null, nextOrderIndex]
  );

  return res.status(201).json({
    id: result.insertId,
    message: 'Servicio creado.'
  });
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl } = req.body;

  await pool.query(
    'UPDATE services SET title = ?, description = ?, image_url = ? WHERE id = ?',
    [title, description, imageUrl, id]
  );

  return res.json({ message: 'Servicio actualizado.' });
};

export const deleteService = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM services WHERE id = ?', [id]);
  return res.json({ message: 'Servicio eliminado.' });
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

export const generateReviewCode = async (req, res) => {
  const { code, expiresAt } = req.body;
  await pool.query('INSERT INTO review_codes (code, expires_at) VALUES (?, ?)', [code, expiresAt || null]);
  return res.status(201).json({ message: 'Código creado.' });
};
