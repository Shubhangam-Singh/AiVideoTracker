import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.REELSTUDIO_DB || path.join(dataDir, 'reelstudio.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const migDir = path.join(__dirname, 'migrations');
for (const f of fs.readdirSync(migDir).sort()) {
  if (!f.endsWith('.sql')) continue;
  const sql = fs.readFileSync(path.join(migDir, f), 'utf8');
  db.exec(sql);
}

export default db;
