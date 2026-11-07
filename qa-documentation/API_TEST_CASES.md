# API Test Cases Specification: PERN Todo Application

**Document Version**: 1.0.0
**Author**: Senior QA Engineer / Test Architect
**Layer**: Backend REST API
**Base URL**: `http://localhost:5001` (Direct) or `http://localhost:5173/api` (Proxied)

---

## 1. System Health Check Endpoint

### `GET /health`
- **Method**: `GET`
- **URL**: `/health`
- **Headers**: `None required`
- **Auth**: None
- **Request Body**: None
- **Expected Status**: `200 OK`
- **Expected Schema**:
  ```json
  {
    "status": "ok"
  }
  ```
- **Positive Test Case (`API-HLT-001`)**: Send `GET /health` -> Expect status 200 and `status === "ok"`.
- **Database Side Effects**: None (pure memory ping).

---

## 2. Authentication Endpoints

### 2.1 `POST /api/auth/register`
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Auth**: None
- **Request Body Contract**:
  ```json
  {
    "name": "string (2-50 chars, trimmed)",
    "email": "string (valid email, sanitized to lowercase)",
    "password": "string (8-72 chars, >=1 letter, >=1 number)",
    "confirmPassword": "string (must match password)"
  }
  ```
- **Response Headers**: `Set-Cookie: token=<JWT>; HttpOnly; Path=/; Max-Age=604800; SameSite=...`
- **Expected Response (201 Created)**:
  ```json
  {
    "user": {
      "id": 1,
      "name": "Alice Tester",
      "email": "alice@example.com",
      "createdAt": "2026-11-06T00:00:00.000Z"
    }
  }
  ```
- **Positive Test Case (`API-REG-001`)**: Valid payload -> Returns 201 Created, user object without password hash, sets `token` cookie.
- **Negative Test Cases**:
  - `API-REG-002`: Missing `name` -> 400 Bad Request `{ "errors": [{ "field": "name", "message": "Name is required" }] }`.
  - `API-REG-003`: `name` < 2 characters -> 400 Bad Request `{ "errors": [{ "field": "name", "message": "Name must be 2–50 characters" }] }`.
  - `API-REG-004`: Invalid `email` format -> 400 Bad Request `{ "errors": [{ "field": "email", "message": "Invalid email format" }] }`.
  - `API-REG-005`: `password` < 8 characters -> 400 Bad Request `{ "errors": [{ "field": "password", "message": "Password must be 8–72 characters" }] }`.
  - `API-REG-006`: `password` without numbers -> 400 Bad Request `{ "errors": [{ "field": "password", "message": "Password must contain at least one number" }] }`.
  - `API-REG-007`: `confirmPassword` mismatch -> 400 Bad Request `{ "errors": [{ "field": "confirmPassword", "message": "Passwords do not match" }] }`.
  - `API-REG-008`: Existing email -> 409 Conflict `{ "errors": [{ "field": "email", "message": "Email already in use" }] }`.
- **Database Side Effects**: Inserts one row into `users` table with bcrypt hash (cost factor 12).

---

### 2.2 `POST /api/auth/login`
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Auth**: None
- **Request Body Contract**:
  ```json
  {
    "email": "string (required, email format)",
    "password": "string (required)"
  }
  ```
- **Response Headers**: `Set-Cookie: token=<JWT>; HttpOnly; ...`
- **Expected Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "name": "Alice Tester",
      "email": "alice@example.com",
      "createdAt": "2026-11-06T00:00:00.000Z"
    }
  }
  ```
- **Positive Test Case (`API-LOG-001`)**: Valid email and password -> Returns 200 OK, user object, sets `token` cookie.
- **Negative Test Cases**:
  - `API-LOG-002`: Missing email -> 400 Bad Request `{ "errors": [{ "field": "email", "message": "Email is required" }] }`.
  - `API-LOG-003`: Missing password -> 400 Bad Request `{ "errors": [{ "field": "password", "message": "Password is required" }] }`.
  - `API-LOG-004`: Non-existent email -> 401 Unauthorized `{ "errors": [{ "message": "Invalid email or password" }] }`.
  - `API-LOG-005`: Wrong password -> 401 Unauthorized `{ "errors": [{ "message": "Invalid email or password" }] }`.
- **Database Side Effects**: Reads `users` table; no mutations.

---

### 2.3 `POST /api/auth/logout`
- **Method**: `POST`
- **URL**: `/api/auth/logout`
- **Headers**: None required
- **Auth**: None
- **Response Headers**: `Set-Cookie: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
- **Expected Response (200 OK)**:
  ```json
  {
    "message": "Logged out"
  }
  ```
- **Positive Test Case (`API-OUT-001`)**: Call `/logout` -> Returns 200 OK, clears `token` cookie.
- **Database Side Effects**: None.

---

### 2.4 `GET /api/auth/me`
- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Headers**: `Cookie: token=<JWT>`
- **Auth**: Yes (`authMiddleware`)
- **Expected Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "name": "Alice Tester",
      "email": "alice@example.com",
      "createdAt": "2026-11-06T00:00:00.000Z"
    }
  }
  ```
- **Positive Test Case (`API-ME-001`)**: With valid cookie -> Returns 200 OK and current user profile.
- **Negative Test Cases**:
  - `API-ME-002`: Missing cookie -> Returns 401 Unauthorized `{ "errors": [{ "message": "Not authenticated" }] }`.
  - `API-ME-003`: Forged/Invalid JWT -> Returns 401 Unauthorized `{ "errors": [{ "message": "Invalid or expired token" }] }`.
- **Database Side Effects**: Reads `users` table where `id = req.userId`.

---

## 3. Todo CRUD Endpoints

### 3.1 `GET /api/todos`
- **Method**: `GET`
- **URL**: `/api/todos`
- **Headers**: `Cookie: token=<JWT>`
- **Auth**: Yes (`authMiddleware`)
- **Query Parameters**: None implemented.
- **Expected Response (200 OK)**:
  ```json
  {
    "todos": [
      {
        "id": 10,
        "title": "Buy groceries",
        "description": "Milk and eggs",
        "is_completed": false,
        "created_at": "2026-11-06T00:00:00.000Z"
      }
    ]
  }
  ```
- **Positive Test Cases**:
  - `API-TDO-001`: User with zero todos -> Returns 200 OK with `{ "todos": [] }`.
  - `API-TDO-002`: User with multiple todos -> Returns 200 OK with todos sorted newest-first (`ORDER BY created_at DESC`).
- **Authorization & Ownership Checks**:
  - `API-TDO-003`: User A only sees todos where `user_id = userA.id`. User B's records are never present.
- **Database Side Effects**: Executes `SELECT ... FROM todos WHERE user_id = $1 ORDER BY created_at DESC`.

---

### 3.2 `POST /api/todos`
- **Method**: `POST`
- **URL**: `/api/todos`
- **Headers**: `Content-Type: application/json`, `Cookie: token=<JWT>`
- **Auth**: Yes (`authMiddleware`)
- **Request Body Contract**:
  ```json
  {
    "title": "string (1-100 chars, trimmed, required)",
    "description": "string (max 500 chars, trimmed, optional/nullable)"
  }
  ```
- **Expected Response (201 Created)**:
  ```json
  {
    "todo": {
      "id": 12,
      "title": "Schedule Dentist Appointment",
      "description": "Call Dr. Smith at 2 PM",
      "is_completed": false,
      "created_at": "2026-11-06T00:00:00.000Z"
    }
  }
  ```
- **Positive Test Cases**:
  - `API-TDO-004`: Title only -> Returns 201 Created with `description: null`, `is_completed: false`.
  - `API-TDO-005`: Title and description -> Returns 201 Created with both values stored.
- **Negative Test Cases**:
  - `API-TDO-006`: Missing title -> 400 Bad Request `{ "errors": [{ "field": "title", "message": "Title is required" }] }`.
  - `API-TDO-007`: Whitespace-only title (`"   "`) -> 400 Bad Request `{ "errors": [{ "field": "title", "message": "Title is required" }] }`.
  - `API-TDO-008`: Title > 100 characters -> 400 Bad Request `{ "errors": [{ "field": "title", "message": "Title must be 1–100 characters" }] }`.
  - `API-TDO-009`: Description > 500 characters -> 400 Bad Request `{ "errors": [{ "field": "description", "message": "Description must be at most 500 characters" }] }`.
- **Database Side Effects**: Inserts one row into `todos` linked to `user_id = req.userId`.

---

### 3.3 `PUT /api/todos/:id`
- **Method**: `PUT`
- **URL**: `/api/todos/:id`
- **Headers**: `Content-Type: application/json`, `Cookie: token=<JWT>`
- **Auth**: Yes (`authMiddleware`)
- **URL Parameters**: `:id` (positive integer required)
- **Request Body Contract**:
  ```json
  {
    "title": "string (1-100 chars, required)",
    "description": "string (max 500 chars, optional/nullable)"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "todo": {
      "id": 12,
      "title": "Updated Title",
      "description": "Updated Description",
      "is_completed": false,
      "created_at": "2026-11-06T00:00:00.000Z"
    }
  }
  ```
- **Positive Test Case (`API-TDO-010`)**: Update title and description on owned todo -> Returns 200 OK with updated record.
- **Negative Test Cases**:
  - `API-TDO-011`: Invalid ID format (`/api/todos/abc` or `/api/todos/-1`) -> 400 Bad Request `{ "errors": [{ "field": "id", "message": "Todo ID must be a positive integer" }] }`.
  - `API-TDO-012`: Empty title in body -> 400 Bad Request `{ "errors": [{ "field": "title", "message": "Title is required" }] }`.
  - `API-TDO-013`: Non-existent todo ID (`999999`) -> 404 Not Found `{ "errors": [{ "message": "Todo not found" }] }`.
- **Authorization & Ownership Check (`API-TDO-014`)**:
  - User A attempts `PUT /api/todos/:id` targeting User B's todo ID -> Returns 404 Not Found `{ "errors": [{ "message": "Todo not found" }] }`. Foreign record remains unmodified.
- **Database Side Effects**: Executes `UPDATE todos SET title = $1, description = $2 WHERE id = $3 AND user_id = $4`.

---

### 3.4 `PATCH /api/todos/:id/toggle`
- **Method**: `PATCH`
- **URL**: `/api/todos/:id/toggle`
- **Headers**: `Cookie: token=<JWT>`
- **Auth**: Yes (`authMiddleware`)
- **URL Parameters**: `:id` (positive integer)
- **Request Body**: None
- **Expected Response (200 OK)**:
  ```json
  {
    "todo": {
      "id": 12,
      "title": "Sample Todo",
      "description": null,
      "is_completed": true,
      "created_at": "2026-11-06T00:00:00.000Z"
    }
  }
  ```
- **Positive Test Cases**:
  - `API-TDO-015`: Toggle uncompleted todo -> Returns 200 OK with `is_completed: true`.
  - `API-TDO-016`: Toggle completed todo -> Returns 200 OK with `is_completed: false`.
- **Negative & Authorization Cases**:
  - `API-TDO-017`: Invalid ID format (`abc`) -> 400 Bad Request.
  - `API-TDO-018`: Foreign user's todo ID -> 404 Not Found.
- **Database Side Effects**: Executes `UPDATE todos SET is_completed = NOT is_completed WHERE id = $1 AND user_id = $2`.

---

### 3.5 `DELETE /api/todos/:id`
- **Method**: `DELETE`
- **URL**: `/api/todos/:id`
- **Headers**: `Cookie: token=<JWT>`
- **Auth**: Yes (`authMiddleware`)
- **URL Parameters**: `:id` (positive integer)
- **Request Body**: None
- **Expected Response (200 OK)**:
  ```json
  {
    "message": "Todo deleted"
  }
  ```
- **Positive Test Case (`API-TDO-019`)**: Delete owned todo -> Returns 200 OK with `{ "message": "Todo deleted" }`. Row removed from database.
- **Negative & Authorization Cases**:
  - `API-TDO-020`: Invalid ID format (`0`, `abc`) -> 400 Bad Request.
  - `API-TDO-021`: Non-existent todo ID -> 404 Not Found.
  - `API-TDO-022`: Foreign user's todo ID -> 404 Not Found. Row remains intact in database.
- **Database Side Effects**: Executes `DELETE FROM todos WHERE id = $1 AND user_id = $2`.
