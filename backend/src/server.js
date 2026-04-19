import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

const startServer = async () => {
  try {
    await checkDatabaseConnection();
    const port = env.PORT;

    app.listen(port, () => {
      console.log(`API Matrona ejecutandose en http://localhost:${port}`);
      console.log(
        `Base de datos conectada en ${env.MYSQL_HOST}:${env.MYSQL_PORT}/${env.MYSQL_DATABASE}`
      );
    });
  } catch (error) {
    console.error('No fue posible conectar a la base de datos.');
    console.error(error);
    process.exit(1);
  }
};

startServer();
