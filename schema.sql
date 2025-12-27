-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  verified INTEGER DEFAULT 0,
  verify_token TEXT NOT NULL,
  unsubscribe_token TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  verified_at TEXT
);

-- Site status table (single row)
CREATE TABLE IF NOT EXISTS site_status (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  status TEXT NOT NULL DEFAULT 'Yes',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Initialize with default status
INSERT OR IGNORE INTO site_status (id, status) VALUES (1, 'Yes');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_verify_token ON subscribers(verify_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token);
