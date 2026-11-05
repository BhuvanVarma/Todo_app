# PERN Todo App

A full-stack Todo List application built with **PostgreSQL, Express, React (Vite), and Node.js**.

## Features

- **Auth**: Register, Login, Logout via JWT stored in an httpOnly cookie
- **Protected routes**: both backend middleware and frontend `ProtectedRoute`
- **Todo CRUD**: Create, list, edit (inline), toggle complete, delete — per user

---

## Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14 running locally

---

## 1 — Database setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE pern_todo;"

# Run the schema
psql -U postgres -d pern_todo -f server/schema.sql
```

---

## 2 — Server setup

```bash
cd server
npm install

# Copy env and fill in your values
cp .env.example .env
```

Edit `server/.env`:

```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/pern_todo
JWT_SECRET=a_long_random_secret_at_least_32_characters
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

Start the server:

```bash
npm run dev      # development (nodemon)
# or
npm start        # production
```

The API listens on **http://localhost:5000**.

---

## 3 — Client setup

```bash
cd client
npm install

# (Optional) copy env — the Vite proxy handles /api automatically
cp .env.example .env
```

Start the client:

```bash
npm run dev
```

The app opens at **http://localhost:5173**.

---

## Project structure

```
pern-todo/
├── server/
│   ├── schema.sql            # Run this to create tables
│   ├── .env.example
│   └── src/
│       ├── index.js          # Express app entry
│       ├── db/pool.js        # pg connection pool
│       ├── middleware/
│       │   ├── auth.js       # JWT auth middleware
│       │   ├── validate.js   # express-validator result handler
│       │   └── errorHandler.js
│       ├── validators/
│       │   ├── auth.js       # Register & login chains
│       │   └── todos.js      # Todo chains
│       ├── controllers/
│       │   ├── auth.js
│       │   └── todos.js
│       └── routes/
│           ├── auth.js
│           └── todos.js
└── client/
    ├── vite.config.js        # Proxies /api -> localhost:5000
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/              # axios instance + per-resource helpers
        ├── context/          # AuthContext
        ├── components/       # Navbar, ProtectedRoute, TodoItem
        ├── pages/            # Login, Register, Todos
        └── utils/            # Client-side validators & error parsers
```

---

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register a new user |
| POST | `/api/auth/login`    | ✗ | Login and receive cookie |
| POST | `/api/auth/logout`   | ✗ | Clear auth cookie |
| GET  | `/api/auth/me`       | ✓ | Get current user |
| GET  | `/api/todos`         | ✓ | List user's todos |
| POST | `/api/todos`         | ✓ | Create a todo |
| PUT  | `/api/todos/:id`     | ✓ | Update title/description |
| PATCH| `/api/todos/:id/toggle` | ✓ | Toggle completed |
| DELETE | `/api/todos/:id`   | ✓ | Delete a todo |

Error responses always follow:
```json
{ "errors": [{ "field": "email", "message": "Email already in use" }] }
```
(`field` is omitted for non-field errors.)

