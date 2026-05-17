-- Platform OAuth tokens (one row per platform, shared across users)
CREATE TABLE IF NOT EXISTS platform_tokens (
  id            TEXT PRIMARY KEY,
  platform      TEXT NOT NULL UNIQUE,
  access_token  TEXT NOT NULL,
  refresh_token TEXT,
  expires_at    INTEGER,
  account_id    TEXT,
  account_name  TEXT,
  connected_at  INTEGER NOT NULL,
  connected_by  TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- Cached analytics data to avoid repeated API calls
CREATE TABLE IF NOT EXISTS analytics_cache (
  key        TEXT PRIMARY KEY,
  data_json  TEXT NOT NULL,
  fetched_at INTEGER NOT NULL
);
