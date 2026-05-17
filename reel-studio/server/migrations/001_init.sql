PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS videos (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  part       TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'idea',
  tool       TEXT NOT NULL DEFAULT '—',
  stage      TEXT NOT NULL DEFAULT 'idea',
  frames     INTEGER NOT NULL DEFAULT 0,
  due        TEXT NOT NULL DEFAULT '—',
  ord        INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS video_assignees (
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id  TEXT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  PRIMARY KEY (video_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id         TEXT PRIMARY KEY,
  who        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  due        TEXT NOT NULL DEFAULT 'Soon',
  video      TEXT NOT NULL DEFAULT '—',
  done       INTEGER NOT NULL DEFAULT 0,
  ord        INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS prompts (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  tool       TEXT NOT NULL DEFAULT '—',
  frames     INTEGER NOT NULL DEFAULT 0,
  body       TEXT NOT NULL DEFAULT '',
  linked_video_id TEXT REFERENCES videos(id) ON DELETE SET NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tools (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  status  TEXT NOT NULL DEFAULT 'active',
  cost    TEXT NOT NULL DEFAULT 'free',
  ord     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS targets (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  value  INTEGER NOT NULL DEFAULT 0,
  goal   INTEGER NOT NULL DEFAULT 1,
  suffix TEXT NOT NULL DEFAULT '',
  note   TEXT NOT NULL DEFAULT '',
  color  TEXT NOT NULL DEFAULT 'sage',
  ord    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS strategy_sections (
  id         TEXT PRIMARY KEY,
  heading    TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  ord        INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS threads (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  linked_video_id TEXT REFERENCES videos(id) ON DELETE SET NULL,
  pinned          INTEGER NOT NULL DEFAULT 0,
  created_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  thread_id       TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  from_user       TEXT NOT NULL,
  kind            TEXT NOT NULL DEFAULT 'text',
  text            TEXT NOT NULL DEFAULT '',
  attachment_json TEXT,
  decision        INTEGER NOT NULL DEFAULT 0,
  decision_text   TEXT NOT NULL DEFAULT '',
  reactions_json  TEXT,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON messages(thread_id, created_at);

CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key     TEXT NOT NULL,
  value   TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);
