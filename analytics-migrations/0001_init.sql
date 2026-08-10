CREATE TABLE hits (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  site         TEXT NOT NULL,
  path         TEXT NOT NULL DEFAULT '',
  ref          TEXT NOT NULL DEFAULT '',
  ref_domain   TEXT NOT NULL DEFAULT '',
  country      TEXT NOT NULL DEFAULT '',
  browser      TEXT NOT NULL DEFAULT '',
  os           TEXT NOT NULL DEFAULT '',
  device       TEXT NOT NULL DEFAULT '',
  screen       TEXT NOT NULL DEFAULT '',
  language     TEXT NOT NULL DEFAULT '',
  utm_source   TEXT NOT NULL DEFAULT '',
  utm_medium   TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  title        TEXT NOT NULL DEFAULT '',
  visitor_hash TEXT NOT NULL DEFAULT '',
  ts           INTEGER NOT NULL
);

CREATE INDEX idx_hits_site_ts ON hits(site, ts);
CREATE INDEX idx_hits_ts      ON hits(ts);
