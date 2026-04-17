import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query('SELECT id, email, password_hash FROM admin_users WHERE email = ?', [email]);
  const admin = rows[0];

  if (!admin) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  const isValid = await bcrypt.compare(password, admin.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  const token = jwt.sign({ id: admin.id, email: admin.email }, env.JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token });
};
