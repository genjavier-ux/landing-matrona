import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(currentDir, '../../.env');

dotenv.config({
  path: envPath,
  override: true
});

const getRequiredEnv = (key) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Falta la variable ${key} en ${envPath}.`);
  }

  return value;
};

export const env = {
  PORT: Number(process.env.PORT || 4000),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'cambia-este-secreto',
  MYSQL_HOST: getRequiredEnv('MYSQL_HOST'),
  MYSQL_PORT: Number(process.env.MYSQL_PORT || 3306),
  MYSQL_USER: getRequiredEnv('MYSQL_USER'),
  MYSQL_PASSWORD: getRequiredEnv('MYSQL_PASSWORD'),
  MYSQL_DATABASE: getRequiredEnv('MYSQL_DATABASE')
};
