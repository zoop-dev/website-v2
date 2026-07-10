CREATE TABLE IF NOT EXISTS links (
  slug    TEXT PRIMARY KEY,
  url     TEXT NOT NULL,
  created INTEGER NOT NULL,
  clicks  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS clicks (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  slug     TEXT NOT NULL,
  ts       INTEGER NOT NULL,
  referrer TEXT,
  country  TEXT,
  ua       TEXT
);

CREATE INDEX IF NOT EXISTS idx_clicks_slug ON clicks(slug);
CREATE INDEX IF NOT EXISTS idx_clicks_ts   ON clicks(ts);
