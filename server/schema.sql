CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sims (
  id TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL DEFAULT '',
  serial_number TEXT DEFAULT '',
  whatsapp_account TEXT DEFAULT '',
  holder TEXT DEFAULT '',
  device TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  registrar TEXT DEFAULT '',
  status TEXT DEFAULT 'idle',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sim_history (
  id TEXT PRIMARY KEY,
  sim_id TEXT REFERENCES sims(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  action TEXT DEFAULT '',
  holder TEXT DEFAULT '',
  device TEXT DEFAULT '',
  whatsapp_account TEXT DEFAULT '',
  note TEXT DEFAULT '',
  by_staff TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  owner_name TEXT DEFAULT '',
  shop_name TEXT DEFAULT '',
  hold_percentage NUMERIC DEFAULT 25,
  debt_alert_days INTEGER DEFAULT 7,
  debt_alert_amount NUMERIC DEFAULT 5000,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  credit_amount NUMERIC DEFAULT 0,
  hold_percentage NUMERIC DEFAULT 0,
  amount_due NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  paid_amount NUMERIC DEFAULT 0,
  note TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
