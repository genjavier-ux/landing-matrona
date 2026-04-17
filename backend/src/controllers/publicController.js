import { pool } from '../config/db.js';

export const getPublicContent = async (_req, res) => {
  const [sections] = await pool.query('SELECT `key`, title, content FROM site_sections');
  const [services] = await pool.query('SELECT id, title, description, image_url AS imageUrl FROM services WHERE is_active = 1 ORDER BY order_index');
  const [testimonials] = await pool.query("SELECT id, patient_name_alias AS patientNameAlias, content FROM testimonials WHERE status = 'approved' ORDER BY id DESC LIMIT 8");
  const [socialLinks] = await pool.query('SELECT id, platform, url FROM social_links WHERE is_active = 1');

  const hero = sections.find((item) => item.key === 'hero') || {
    title: 'Matrona Contigo',
    content: 'Cuidado integral y cercano.'
  };

  return res.json({
    hero: { title: hero.title, description: hero.content },
    services,
    testimonials,
    socialLinks
  });
};

export const createContact = async (req, res) => {
  const { name, email, phone, message } = req.body;
  await pool.query('INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)', [name, email, phone || null, message]);
  return res.status(201).json({ message: 'Solicitud recibida.' });
};

export const createSubscription = async (req, res) => {
  const { email } = req.body;
  await pool.query('INSERT IGNORE INTO subscribers (email, source) VALUES (?, ?)', [email, 'landing']);
  return res.status(201).json({ message: 'Suscripción guardada.' });
};

export const createTestimonial = async (req, res) => {
  const { patientNameAlias, content, reviewCode } = req.body;

  const [codes] = await pool.query(
    'SELECT id, is_used, expires_at FROM review_codes WHERE code = ? LIMIT 1',
    [reviewCode]
  );

  const code = codes[0];
  if (!code || code.is_used) {
    return res.status(400).json({ message: 'Código inválido o usado.' });
  }

  if (code.expires_at && new Date(code.expires_at) < new Date()) {
    return res.status(400).json({ message: 'Código expirado.' });
  }

  await pool.query(
    "INSERT INTO testimonials (patient_name_alias, content, status) VALUES (?, ?, 'pending')",
    [patientNameAlias, content]
  );

  await pool.query('UPDATE review_codes SET is_used = 1 WHERE id = ?', [code.id]);

  return res.status(201).json({ message: 'Comentario enviado a moderación.' });
};
