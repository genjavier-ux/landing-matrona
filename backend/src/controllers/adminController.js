import { pool } from '../config/db.js';

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl } = req.body;

  await pool.query(
    'UPDATE services SET title = ?, description = ?, image_url = ? WHERE id = ?',
    [title, description, imageUrl, id]
  );

  return res.json({ message: 'Servicio actualizado.' });
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
