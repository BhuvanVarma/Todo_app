# Database Test Cases Specification: PERN Todo Application

**Document Version**: 1.0.0
**Author**: Senior QA Engineer / Test Architect
**Layer**: PostgreSQL Database (Schema, Constraints, Queries & Integrity)
**Target Schema**: `users`, `todos`, `todos_user_id_idx`

---

## 1. Schema Constraints & Architecture Reference

```sql
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
```

---

## 2. Database Test Scenarios

### DB-TC-001: Record Creation Integrity (`users`)
- **Objective**: Verify inserting a valid user persists all columns with correct defaults and constraints.
- **SQL Verification**:
  ```sql
  INSERT INTO users (name, email, password_hash)
  VALUES ('Database Test User', 'db_test_user@example.com', '$2a$12$eX4mpleH4shV4lu3')
  RETURNING id, name, email, password_hash, created_at;
  ```
- **Expected Outcome**:
  - Row created successfully.
  - `id` generated as a positive integer (`SERIAL`).
  - `created_at` automatically assigned within current UTC timestamp window (`DEFAULT NOW()`).
  - `password_hash` stored intact without truncation.

---

### DB-TC-002: CHECK Constraint Enforcement on `users(name)`
- **Objective**: Verify `CHECK (char_length(trim(name)) >= 2)` rejects names with < 2 non-whitespace characters.
- **SQL Verification (Negative Tests)**:
  ```sql
  -- Test 1: Single character name
  INSERT INTO users (name, email, password_hash)
  VALUES ('A', 'invalid_name_1@example.com', 'dummyhash');

  -- Test 2: Whitespace padding resulting in 1 character
  INSERT INTO users (name, email, password_hash)
  VALUES ('  A  ', 'invalid_name_2@example.com', 'dummyhash');

  -- Test 3: Pure whitespace name
  INSERT INTO users (name, email, password_hash)
  VALUES ('    ', 'invalid_name_3@example.com', 'dummyhash');
  ```
- **Expected Outcome**: All three queries fail with error:
  `ERROR: new row for relation "users" violates check constraint "users_name_check"`.

---

### DB-TC-003: UNIQUE Constraint Enforcement on `users(email)`
- **Objective**: Verify database prevents duplicate email records regardless of application logic.
- **SQL Verification**:
  ```sql
  -- Step 1: Insert initial record
  INSERT INTO users (name, email, password_hash)
  VALUES ('First User', 'unique_test@example.com', 'hash1');

  -- Step 2: Attempt duplicate insert
  INSERT INTO users (name, email, password_hash)
  VALUES ('Duplicate User', 'unique_test@example.com', 'hash2');
  ```
- **Expected Outcome**: Step 2 fails with:
  `ERROR: duplicate key value violates unique constraint "users_email_key"`.

---

### DB-TC-004: Foreign Key Constraint on `todos(user_id)`
- **Objective**: Verify inserting a todo linked to a non-existent `user_id` is rejected.
- **SQL Verification**:
  ```sql
  INSERT INTO todos (user_id, title)
  VALUES (999999, 'Orphaned Todo');
  ```
- **Expected Outcome**: Query fails with:
  `ERROR: insert or update on table "todos" violates foreign key constraint "todos_user_id_fkey"`.

---

### DB-TC-005: Foreign Key Cascade Deletion (`ON DELETE CASCADE`)
- **Objective**: Verify that deleting a user record immediately cascades and deletes all their associated todos.
- **SQL Verification**:
  ```sql
  -- Step 1: Create test user and 3 child todos
  INSERT INTO users (name, email, password_hash)
  VALUES ('Cascade User', 'cascade@example.com', 'hash')
  RETURNING id; -- Assume id = 100

  INSERT INTO todos (user_id, title) VALUES
  (100, 'Todo 1'),
  (100, 'Todo 2'),
  (100, 'Todo 3');

  -- Step 2: Verify todos exist
  SELECT COUNT(*) FROM todos WHERE user_id = 100; -- Expect 3

  -- Step 3: Delete parent user
  DELETE FROM users WHERE id = 100;

  -- Step 4: Verify child todos are purged
  SELECT COUNT(*) FROM todos WHERE user_id = 100;
  ```
- **Expected Outcome**: Step 4 returns count `0`. No orphaned todos remain.

---

### DB-TC-006: CHECK Constraint Enforcement on `todos(title)`
- **Objective**: Verify `CHECK (char_length(trim(title)) >= 1)` rejects empty and whitespace-only titles.
- **SQL Verification (Negative Tests)**:
  ```sql
  -- Test 1: Empty string
  INSERT INTO todos (user_id, title) VALUES (1, '');

  -- Test 2: Whitespace string
  INSERT INTO todos (user_id, title) VALUES (1, '     ');
  ```
- **Expected Outcome**: Queries fail with:
  `ERROR: new row for relation "todos" violates check constraint "todos_title_check"`.

---

### DB-TC-007: Default Column Values on `todos`
- **Objective**: Verify `is_completed` defaults to `false` and `created_at` defaults to `NOW()`.
- **SQL Verification**:
  ```sql
  INSERT INTO todos (user_id, title)
  VALUES (1, 'Default Test Task')
  RETURNING id, is_completed, created_at;
  ```
- **Expected Outcome**:
  - `is_completed` equals `false`.
  - `created_at` is populated with valid timestamp.

---

### DB-TC-008: Verify Index Usage on User Queries
- **Objective**: Confirm PostgreSQL query planner uses index `todos_user_id_idx` when filtering by user.
- **SQL Verification**:
  ```sql
  EXPLAIN SELECT id, title, description, is_completed, created_at
  FROM todos
  WHERE user_id = 1
  ORDER BY created_at DESC;
  ```
- **Expected Outcome**: Query plan utilizes `Bitmap Index Scan on todos_user_id_idx` or `Index Scan using todos_user_id_idx`.

---

### DB-TC-009: Cross-User Isolation Query Simulation
- **Objective**: Simulate application query logic directly in SQL to prove cross-tenant boundaries.
- **SQL Verification**:
  ```sql
  -- User 1 attempts to update User 2's todo (id=50)
  UPDATE todos
  SET title = 'Unauthorized Title'
  WHERE id = 50 AND user_id = 1;

  -- Check rows affected
  ```
- **Expected Outcome**: Query returns `UPDATE 0` (0 rows affected). Data remains secure.
