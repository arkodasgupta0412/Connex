import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DB_USERS = path.join(__dirname, "../../users.json");
export const DB_GROUPS = path.join(__dirname, "../../groups.json");
export const UPLOAD_DIR = path.join(__dirname, "../../uploads");