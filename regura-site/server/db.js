import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'regura.db');
const db = new Database(dbPath);

export function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(schema);
}

export function getDb() { return db; }

if (process.argv.includes('--init')) {
  init();
  console.log('DB initialized at', dbPath);
}