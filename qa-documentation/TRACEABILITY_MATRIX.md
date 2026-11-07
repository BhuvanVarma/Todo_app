# Traceability Matrix & Test Suite Mapping

**Document Version**: 1.0.0
**Author**: Senior QA Engineer / Test Architect
**Purpose**: Map requirements and API endpoints to test cases, define test execution suites, and analyze automation feasibility.

---

## 1. Feature-to-Test-Case Traceability Matrix

| Feature ID | Functional Requirement | Test Case ID | Test Layer | Priority | Automation |
|---|---|---|---|---|---|
| **REQ-AUTH-01** | User Registration with Name, Email, Password | `TC-REG-001`, `API-REG-001` | UI / API | Critical | Yes |
| **REQ-AUTH-02** | Registration Field Validations | `TC-REG-002` to `TC-REG-005` | UI / API | High | Yes |
| **REQ-AUTH-03** | Duplicate Email Conflict (409) | `TC-REG-006`, `API-REG-008` | UI / API / DB | Critical | Yes |
| **REQ-AUTH-04** | Password Complexity & Confirmation Matching | `TC-REG-007`, `TC-REG-008` | UI / API | High | Yes |
| **REQ-AUTH-05** | User Login with Email & Password | `TC-LOG-001`, `API-LOG-001` | UI / API | Critical | Yes |
| **REQ-AUTH-06** | Generic Authentication Failure on Bad Credentials | `TC-LOG-003`, `TC-LOG-004` | UI / API | Critical | Yes |
| **REQ-AUTH-07** | httpOnly JWT Cookie Management & Storage | `TC-AUT-003`, `API-REG-001` | API / Security | Critical | Yes |
| **REQ-AUTH-08** | Client-Side Route Protection (`/todos`) | `TC-AUT-001` | UI | Critical | Yes |
| **REQ-AUTH-09** | Session Hydration on Page Refresh (`GET /me`) | `TC-AUT-002`, `API-ME-001` | UI / API | Critical | Yes |
| **REQ-AUTH-10** | User Logout and Token Invalidation | `TC-OUT-001`, `API-OUT-001` | UI / API | Critical | Yes |
| **REQ-TODO-01** | Create Todo with Title & Optional Description | `TC-TCR-001`, `TC-TCR-002` | UI / API | Critical | Yes |
| **REQ-TODO-02** | Todo Title Length & Non-Empty Validation | `TC-TCR-003`, `TC-TCR-004` | UI / API / DB | High | Yes |
| **REQ-TODO-03** | List User's Todos (Reverse Chronological) | `TC-TLI-002`, `API-TDO-002` | UI / API | High | Yes |
| **REQ-TODO-04** | Empty State Placeholder Rendering | `TC-TLI-001` | UI | Medium | Yes |
| **REQ-TODO-05** | In-Place Inline Todo Editing | `TC-TUP-001`, `TC-TUP-002` | UI / API | Critical | Yes |
| **REQ-TODO-06** | Toggle Todo Completion Status | `TC-TTG-001`, `TC-TTG-002` | UI / API | Critical | Yes |
| **REQ-TODO-07** | Delete Todo with Browser Confirmation | `TC-TDL-001`, `TC-TDL-002` | UI / API | Critical | Yes |
| **REQ-SEC-01** | Multi-Tenant Cross-User Data Isolation | `TC-ISO-001` to `TC-ISO-004` | API / Security | Critical | Yes |
| **REQ-SEC-02** | Return 404 on Unauthorized Resource Access | `TC-ISO-002`, `TC-ISO-005` | API / Security | Critical | Yes |
| **REQ-DB-01** | Database Cascade Deletion on User Purge | `TC-DBI-001` | Database | Critical | Yes |
| **REQ-DB-02** | Database Level Constraints (`CHECK`, `UNIQUE`) | `TC-DBI-002`, `TC-DBI-003` | Database | High | Yes |

---

## 2. API Endpoint-to-Test-Case Mapping

| HTTP Endpoint | Covered By Test Cases | Layer |
|---|---|---|
| `GET /health` | `API-HLT-001` | API |
| `POST /api/auth/register` | `TC-REG-001`, `TC-REG-006`, `API-REG-001` to `API-REG-008` | UI / API |
| `POST /api/auth/login` | `TC-LOG-001`, `TC-LOG-003`, `TC-LOG-004`, `API-LOG-001` to `API-LOG-005` | UI / API |
| `POST /api/auth/logout` | `TC-OUT-001`, `API-OUT-001` | UI / API |
| `GET /api/auth/me` | `TC-AUT-002`, `API-ME-001` to `API-ME-003` | UI / API |
| `GET /api/todos` | `TC-TLI-001`, `TC-TLI-002`, `API-TDO-001` to `API-TDO-003` | UI / API |
| `POST /api/todos` | `TC-TCR-001`, `TC-TCR-002`, `API-TDO-004` to `API-TDO-009` | UI / API |
| `PUT /api/todos/:id` | `TC-TUP-002`, `API-TDO-010` to `API-TDO-014` | UI / API |
| `PATCH /api/todos/:id/toggle` | `TC-TTG-001`, `TC-TTG-002`, `API-TDO-015` to `API-TDO-018` | UI / API |
| `DELETE /api/todos/:id` | `TC-TDL-002`, `API-TDO-019` to `API-TDO-022` | UI / API |
| Catch-All (`*`) 404 | `TC-ERR-003` | API |

---

## 3. Test Execution Suites

### 3.1 Critical Smoke Test Suite (Run Time: < 30 seconds)
Must pass on every PR before any merge is allowed.
1. `API-HLT-001`: Health check liveness probe.
2. `TC-REG-001` / `API-REG-001`: User registration and cookie issuance.
3. `TC-LOG-001` / `API-LOG-001`: User login with valid credentials.
4. `TC-AUT-001`: Protected route blocks unauthenticated access.
5. `TC-TCR-001` / `API-TDO-004`: Create todo with title.
6. `TC-TTG-001` / `API-TDO-015`: Toggle completion status.
7. `TC-TDL-002` / `API-TDO-019`: Delete todo.
8. `TC-OUT-001` / `API-OUT-001`: Logout and session termination.

### 3.2 Regression Test Suite (Run Time: ~2-3 minutes)
Runs in GitHub Actions CI nightly and on merges to `main`.
- All 12 Registration test cases (`TC-REG-*`, `API-REG-*`).
- All 9 Login test cases (`TC-LOG-*`, `API-LOG-*`).
- All 7 Authentication & Cookie validation tests.
- All 22 Todo CRUD & Boundary test cases.
- All 5 Multi-tenant Data Isolation security test cases.
- All Database Constraint and Foreign Key tests.

---

## 4. Automation Suitability Summary

| Test Layer | Total Identified Test Cases | Automatable | Automation Candidate Tool |
|---|---|---|---|
| **UI Testing** | 25 | 25 (100%) | Playwright Test (Chromium) |
| **API Testing** | 26 | 26 (100%) | Playwright APIRequestContext |
| **Database Testing** | 9 | 9 (100%) | `pg` Pool Node Script / SQL assertions |
| **Integration / E2E** | 4 | 4 (100%) | Playwright E2E Browser contexts |
| **Total** | **64** | **64 (100%)** | Fully automatable |
