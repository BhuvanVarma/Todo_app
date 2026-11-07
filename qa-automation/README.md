# Playwright QA Automation Framework: PERN Todo App

A comprehensive, production-grade JavaScript test automation framework built with Playwright Test (`@playwright/test`) for the PERN Todo full-stack application (PostgreSQL + Express + React + Node.js).

---

## 1. Architecture Overview

The automation framework is completely decoupled from the production application, operating under its own `package.json` with native ES Modules (`"type": "module"`). It isolates API testing, UI testing, and Full-Stack Integration testing into dedicated Playwright projects.

```text
qa-automation/
├── fixtures/
│   └── index.js              # Custom test runner fixtures (apiClient, registeredUser, authenticatedPage, page objects)
├── pages/                    # Page Object Model (POM) using accessible semantic locators
│   ├── LoginPage.js          # /login interactions & assertions
│   ├── RegisterPage.js       # /register interactions & validation assertions
│   ├── TodosPage.js          # /todos CRUD, inline edit, toggling, and dialog handlers
│   ├── Navbar.js             # Global navigation bar & logout
│   └── index.js              # Centralized Page Object exports
├── test-data/
│   └── index.js              # Centralized test fixtures, boundary values & validation payloads
├── tests/
│   ├── api/                  # Backend REST API test suite (36 tests)
│   │   ├── smoke-health.spec.js      # Health ping contract
│   │   ├── auth-register.spec.js     # User registration positive/negative/duplicate contracts
│   │   ├── auth-login.spec.js        # Authentication credentials & error contracts
│   │   ├── auth-session.spec.js      # Session profile & logout verification
│   │   ├── todos-crud.spec.js        # Todo lifecycle CRUD operations
│   │   ├── todos-validation.spec.js  # Field validation & ID boundaries
│   │   └── todos-security.spec.js    # Unauthenticated access & multi-user data isolation
│   ├── ui/                   # Frontend React SPA test suite (25 tests)
│   │   ├── smoke-login.spec.js       # View accessibility verification
│   │   ├── auth-register.spec.js     # Register UI workflows & field errors
│   │   ├── auth-login.spec.js        # Login UI workflows & authentication redirects
│   │   ├── auth-session-nav.spec.js  # Protected route guards & session persistence
│   │   ├── todos-crud.spec.js        # Todo creation, editing, toggling, deletion & dialogs
│   │   └── todos-multiple.spec.js    # List ordering & state independence
│   └── integration/          # Multi-tier E2E fullstack scenarios (5 tests)
│       └── integration-e2e.spec.js   # Cross-tier UI <-> API verification workflows
├── utils/
│   ├── apiClient.js          # Reusable API HTTP client wrapping Playwright APIRequestContext
│   └── index.js              # Dynamic data generators (unique emails, user payloads)
├── .env.example              # Environment variables template
├── .gitignore                # Excludes node_modules, reports, artifacts, .env*
├── package.json              # Standalone automation dependencies & npm scripts
├── playwright.config.js      # Multi-project test runner configuration
└── README.md                 # Framework documentation
```

---

## 2. Test Coverage Summary

| Suite / Project | Spec Files | Tests Implemented | Tests Passed | Status |
|---|---|:---:|:---:|:---:|
| **API Suite** (`--project=api`) | 7 spec files | 36 | 36 | ✅ 100% Pass |
| **UI Suite** (`--project=ui`) | 6 spec files | 25 | 25 | ✅ 100% Pass |
| **Integration Suite** (`--project=integration`) | 1 spec file | 5 | 5 | ✅ 100% Pass |
| **Total Test Suite** | **14 spec files** | **66** | **66** | **✅ 100% Pass** |

---

## 3. Implemented Scenarios

### API Scenarios (`tests/api/`)
- **Health**: `GET /health` returns 200 OK with `{ status: "ok" }`.
- **Registration**:
  - `API-REG-001`: Valid registration (201 Created, Set-Cookie token, user object sans password).
  - `API-REG-002`: Duplicate registration (409 Conflict, `Email already in use`).
  - `API-REG-003`: Missing required fields (400 Bad Request).
  - `API-REG-004`: Short name (<2 chars) validation (400 Bad Request).
  - `API-REG-005`: Malformed email formats validation (400 Bad Request).
  - `API-REG-006`: Short password (<8 chars) validation (400 Bad Request).
  - `API-REG-007`: Password missing numbers validation (400 Bad Request).
  - `API-REG-008`: Password missing letters validation (400 Bad Request).
  - `API-REG-009`: Mismatched confirmPassword validation (400 Bad Request).
- **Login**:
  - `API-LOG-001`: Valid login (200 OK, auth cookie).
  - `API-LOG-002`: Incorrect password (401 Unauthorized).
  - `API-LOG-003`: Non-existent user (401 Unauthorized).
  - `API-LOG-004`: Missing credentials (400 Bad Request).
  - `API-LOG-005`: Malformed email format (400 Bad Request).
- **Session & Logout**:
  - `API-SES-001`: `GET /api/auth/me` returns current user profile (200 OK).
  - `API-SES-002`: `GET /api/auth/me` without cookie returns 401 Unauthorized (`Not authenticated`).
  - `API-SES-003`: `GET /api/auth/me` with invalid/tampered token returns 401 Unauthorized.
  - `API-SES-004`: `POST /api/auth/logout` clears token cookie and invalidates session.
- **Todos CRUD**:
  - `API-TODO-001`: Create todo with title and description (201 Created).
  - `API-TODO-002`: Create todo with title only (201 Created, description null).
  - `API-TODO-003`: Boundary max lengths (100 char title, 500 char description).
  - `API-TODO-004`: List user todos ordered newest first (200 OK).
  - `API-TODO-005`: Update todo title and description (200 OK).
  - `API-TODO-006`: Toggle todo completion state (200 OK).
  - `API-TODO-007`: Delete todo and verify removal (200 OK).
- **Todos Validation & Edge Cases**:
  - `API-VAL-001`: Missing title rejected (400 Bad Request).
  - `API-VAL-002`: Whitespace-only title rejected (400 Bad Request).
  - `API-VAL-003`: Title > 100 characters rejected (400 Bad Request).
  - `API-VAL-004`: Description > 500 characters rejected (400 Bad Request).
  - `API-VAL-005`: Invalid non-numeric ID rejected (400 Bad Request).
  - `API-VAL-006`: Negative or zero ID rejected (400 Bad Request).
  - `API-VAL-007`: Update non-existent ID returns 404 Not Found.
  - `API-VAL-008`: Delete non-existent ID returns 404 Not Found.
- **Security & Multi-User Data Isolation**:
  - `API-SEC-001`: All todo endpoints reject unauthenticated requests with 401 Unauthorized.
  - `API-SEC-002`: Multi-user data isolation (User B cannot list, update, toggle, or delete User A's todos; returns 404 and leaves User A's data intact).

### UI Scenarios (`tests/ui/`)
- **Registration**: Form rendering, empty submission field errors, password mismatch error, successful registration redirect to `/todos` with navbar greeting, duplicate email field error.
- **Login**: Form validation errors, invalid credentials alert banner, valid login redirect, navigation link to register.
- **Navigation & Guards**: Direct `/todos` navigation redirects to `/login`, wildcard route redirect, session persistence across page reload, logout clears session and blocks access to `/todos`.
- **Todos CRUD**: Empty state message, empty title validation error, create todo (title only), create todo (with description toggle), toggle completion checkbox and strikethrough, edit title and description, cancel edit, delete todo with confirmation dialog, dismiss delete dialog.
- **Multiple Todos**: List ordering (newest first / LIFO), independent completion status across items.

### Integration Scenarios (`tests/integration/`)
- `INT-001`: Register through UI, create Todo in UI, and verify persistence via direct backend API call.
- `INT-002`: Create Todo through backend API and verify immediate rendering in browser UI upon reload.
- `INT-003`: Update and complete Todo in UI, verify backend data integrity via API.
- `INT-004`: Multi-user data isolation across UI and API (User B cannot see or manipulate User A's items).
- `INT-005`: Delete Todo in UI and verify complete cleanup in database via API.

---

## 4. Execution Commands

From inside `qa-automation/`:

```bash
# Run all tests (API, UI, and Integration in parallel)
npm test

# Run API tests only (headless, no browser launched)
npm run test:api

# Run UI tests only (Chromium)
npm run test:ui

# Run Integration tests only (Chromium + API)
npm run test:integration

# Run UI tests with visible browser
npm run test:headed

# Open interactive Playwright Inspector for step debugging
npm run test:debug

# View generated HTML report locally
npm run report
```

---

## 5. CI/CD Integration (GitHub Actions)

The framework is integrated into `.github/workflows/ci.yml` under an independent `e2e` job that:
1. Boots a temporary PostgreSQL service container.
2. Applies `server/schema.sql`.
3. Starts the Express backend (`http://localhost:5001`) and Vite frontend (`http://localhost:5173`).
4. Runs `npm test` using Playwright in CI mode.
5. Uploads the HTML report as an artifact (`playwright-report`).
