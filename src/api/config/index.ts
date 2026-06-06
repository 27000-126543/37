import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const JWT_SECRET = process.env.JWT_SECRET || 'vocedu-secret-2024';

export const PORT = Number(process.env.PORT) || 4000;

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

export const UPLOAD_DIR = path.join(PROJECT_ROOT, 'uploads');

export const DATA_DIR = path.join(PROJECT_ROOT, 'data');

export const DB_PATH = path.join(DATA_DIR, 'vocedu.db');

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export default {
  JWT_SECRET,
  PORT,
  UPLOAD_DIR,
  DATA_DIR,
  DB_PATH,
  JWT_EXPIRES_IN,
};
