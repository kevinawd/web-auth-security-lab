import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');

const dbPath = path.isAbsolute(config.dbFile)
  ? config.dbFile
  : path.resolve(serverRoot, config.dbFile);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      email         TEXT NOT NULL UNIQUE,
      display_name  TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS login_events (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier_attempted TEXT,
      has_password         INTEGER NOT NULL DEFAULT 0,
      success              INTEGER NOT NULL DEFAULT 0,
      ip                   TEXT,
      user_agent           TEXT,
      created_at           TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_login_events_created
      ON login_events (created_at DESC);
  `);
}

export { dbPath };
