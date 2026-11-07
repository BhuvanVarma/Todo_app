# Master Test Plan: PERN Todo Application

**Document Version**: 1.0.0
**Role**: Senior QA Engineer / Test Architect
**Status**: Ready for Review

---

## 1. Project Overview
The PERN Todo application is a full-stack task management platform built on PostgreSQL, Express, React (Vite), and Node.js. It features a complete multi-user authentication model using JWTs transmitted via `httpOnly` secure cookies, robust input validation on both client and server tiers, and isolated, user-scoped CRUD operations for personal todos.

---

## 2. Testing Objectives
1. **Functional Integrity**: Ensure all implemented features (registration, authentication, session recovery, todo creation, listing, inline editing, completion toggle, deletion, and logout) function strictly according to specification.
2. **Data & Multi-Tenant Isolation**: Guarantee that users can never access, inspect, modify, toggle, or delete another user's todos under any circumstances.
3. **Validation & Boundary Adherence**: Verify that input validation constraints (character lengths, regex formats, password complexity, boundary values) are rigorously enforced by both client UI and server controllers.
4. **Resilience & Error Handling**: Validate that database errors, duplicate conflicts, unauthorized requests, and network interruptions produce clean, user-friendly feedback without leaking system stack traces or sensitive credentials.
5. **Automation Readiness**: Establish clear, structured test cases suitable for implementation in a modern JavaScript + Playwright automated testing framework integrated into GitHub Actions CI/CD.

---

## 3. Scope of Testing

### 3.1 In-Scope Functionality
- **User Authentication & Session Management**:
  - User registration with client & server-side validation.
  - Password hashing and duplicate email rejection (409 Conflict).
  - User login with generic rejection on bad credentials (401 Unauthorized).
  - Cookie issuance (`httpOnly`, `SameSite`, `Secure` in production) and verification.
  - Silent session verification via `GET /api/auth/me` with `localStorage` optimization flag.
  - Logout and cookie invalidation.
  - Client-side route protection (`<ProtectedRoute />`).
- **Todo CRUD Operations**:
  - Creation with required title and optional description.
  - Listing with loading state, empty state (`No todos yet`), and reverse-chronological ordering.
  - In-place editing of title and description with save and cancel triggers.
  - Toggling completion status with visual strike-through styling.
  - Deletion with browser `confirm()` dialogue.
- **Cross-Layer Data Integrity**:
  - PostgreSQL constraints: foreign keys (`ON DELETE CASCADE`), unique constraints, check constraints (`title` not empty, `name` >= 2 chars).
- **API Contracts & Health Probe**:
  - All 10 defined HTTP endpoints, payload contracts, and error structures.

### 3.2 Out-of-Scope Functionality
The following features are **not implemented** in the application and are explicitly excluded from testing:
- Password reset / "Forgot Password" workflows.
- Email verification links / OAuth / Social login.
- Todo search, filtering by completed/active, tag management, or due dates.
- Todo pagination or sorting options (other than default reverse-chronological).
- User profile editing or account deletion workflows.
- Dark mode or custom UI theming.

---

## 4. Testing Types & Strategy

| Testing Type | Description & Strategy | Target Tool / Layer |
|---|---|---|
| **Smoke Testing** | Fast verification of critical operational path (health check, register, login, create todo, logout). | Playwright / Curl / Manual |
| **Functional UI Testing** | End-to-end browser execution validating forms, DOM updates, alert banners, inline errors, and navigation. | Playwright Chromium/Firefox/WebKit |
| **API Testing** | Direct HTTP request testing validating status codes, JSON response schemas, headers, and cookie handling. | Playwright API / Supertest |
| **Security & Authorization** | Bypassing client UI to attack endpoints with tampered cookies, cross-tenant IDs, and SQL injection payloads. | API Testing / OWASP criteria |
| **Database Testing** | Direct SQL inspection verifying table records, cascade deletions, constraint enforcement, and index usage. | `pg` / `psql` queries |
| **Negative & Boundary Testing** | Systematic evaluation of min/max lengths, empty strings, whitespace-only inputs, and malicious payloads. | UI & API Test Suites |
| **Regression Testing** | Repeatable test suites executed via GitHub Actions CI on every push and pull request. | GitHub Actions CI runner |

---

## 5. Test Environment Architecture

```
+-------------------------------------------------------------------------------+
|                             TEST ENVIRONMENT                                  |
|                                                                               |
|   Frontend Client: Vite Dev Server at http://localhost:5173                   |
|   Backend API: Express Server at http://localhost:5001                        |
|   Proxy: /api -> http://localhost:5001 (handled via vite.config.js)          |
|                                                                               |
|   Databases:                                                                  |
|   1. Local Dev: postgresql://bhuvanvarmakonduru@localhost:5432/pern_todo      |
|   2. Cloud Staging: Neon Serverless PostgreSQL (branch: production)           |
+-------------------------------------------------------------------------------+
```

---

## 6. Entry and Exit Criteria

### 6.1 Entry Criteria
1. Application backend is running on `http://localhost:5001` and returns `200 OK` on `/health`.
2. Application frontend is running on `http://localhost:5173` and displays `<Login />` or `<Todos />`.
3. Target PostgreSQL database schema is migrated with `users` and `todos` tables.
4. Test environment credentials and ports are configured in `.env` files.

### 6.2 Exit Criteria
1. 100% of Critical and High-priority test cases pass successfully.
2. Zero data leaks between independent user accounts.
3. All input validation rules match on both client and server tiers.
4. No unhandled server exceptions (500 errors) during negative testing.
5. Automated test suites pass with 100% stability across multiple runs.

---

## 7. Test Data Management & Cleanup Strategy
- All test users must utilize dynamic, timestamped email addresses (e.g., `testuser_{timestamp}@example.com`) to avoid collision during repeated test runs.
- Multi-tenant test suites must provision at least two isolated users (`User A` and `User B`).
- Any todo items created during integration runs must be cleaned up via API calls or automated transaction rollbacks.
- Never use real personal passwords or production secret keys in test data.

---

## 8. Risks and Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|---|---|---|---|
| **Stale JWT Cookie in Test Runner** | Tests fail due to unexpected existing session. | High | Test framework must explicitly clear browser context cookies and `localStorage` between test scenarios. |
| **Browser Native Dialog Interruption (`window.confirm`)** | Test hangs waiting for manual click on delete dialog. | High | Automated Playwright tests must pre-register `page.on('dialog', dialog => dialog.accept())` handler. |
| **Asynchronous Network Race Conditions** | UI assertions fail before DOM reflects state change. | Medium | Use locator auto-waiting (`expect(locator).toBeVisible()`) instead of arbitrary hard sleeps. |
| **Database Connection Exhaustion** | Concurrent test execution overwhelms Postgres pool. | Low | Configure connection pool limits (`max: 10`) and close idle connections properly. |
