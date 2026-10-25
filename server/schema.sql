-- Роли пользователей
CREATE TABLE IF NOT EXISTS Roles (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Пользователи
CREATE TABLE IF NOT EXISTS Users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role_id       INTEGER NOT NULL REFERENCES Roles(id),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Услуги
CREATE TABLE IF NOT EXISTS Services (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  description  TEXT    NOT NULL,
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  price        REAL    NOT NULL CHECK (price >= 0)
);

-- Записи на услуги
CREATE TABLE IF NOT EXISTS Appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES Users(id),
  service_id   INTEGER NOT NULL REFERENCES Services(id),
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  scheduled_at TEXT    NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'confirmed', 'cancelled', 'done')),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Платежи
CREATE TABLE IF NOT EXISTS Payments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER NOT NULL REFERENCES Appointments(id),
  amount         REAL    NOT NULL CHECK (amount >= 0),
  method         TEXT    NOT NULL DEFAULT 'card',
  status         TEXT    NOT NULL DEFAULT 'paid'
                 CHECK (status IN ('pending', 'paid', 'refunded')),
  paid_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);
