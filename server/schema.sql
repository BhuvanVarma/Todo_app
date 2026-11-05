-- PERN Todo App Schema
-- Run with: psql -d your_db_name -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(50)  NOT NULL CHECK (char_length(trim(name)) >= 2),
  email        VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS todos (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(100) NOT NULL CHECK (char_length(trim(title)) >= 1),
  description  VARCHAR(500),
  is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);

