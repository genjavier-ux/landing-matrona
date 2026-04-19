import fs from 'fs';
import mysql from 'mysql2/promise';
import { env } from './env.js';

const buildSslOptions = () => {
  if (!env.MYSQL_SSL_ENABLED) {
    return undefined;
  }

  const ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: env.MYSQL_SSL_REJECT_UNAUTHORIZED
  };

  if (env.MYSQL_SSL_CA_PATH) {
    if (fs.existsSync(env.MYSQL_SSL_CA_PATH)) {
      ssl.ca = fs.readFileSync(env.MYSQL_SSL_CA_PATH, 'utf8');
    } else {
      console.warn(
        `Advertencia: no se encontró MYSQL_SSL_CA_PATH=${env.MYSQL_SSL_CA_PATH}. ` +
          'Se intentará usar los certificados CA del sistema para SSL.'
      );
    }
  } else if (env.MYSQL_SSL_REJECT_UNAUTHORIZED) {
    console.warn(
      'MYSQL_SSL_ENABLED está activado, pero MYSQL_SSL_CA_PATH no está configurado. ' +
        'Se intentará validar con los certificados CA del sistema.'
    );
  }

  return ssl;
};

const sslOptions = buildSslOptions();

export const pool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  ssl: sslOptions,
  waitForConnections: true,
  connectionLimit: 10
});

export const checkDatabaseConnection = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
};
