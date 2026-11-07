# QA Gap Analysis & Quality Review: PERN Todo Application

**Document Version**: 1.0.0
**Author**: Senior QA Engineer / Test Architect
**Purpose**: Document discovered edge cases, specification gaps, ambiguous behaviors, and architectural recommendations for future sprint planning.

---

## 1. Discovered Gaps & Missing Requirements

### 1.1 Rate Limiting & Brute-Force Protection
- **Current Behavior**: The endpoints `/api/auth/login` and `/api/auth/register` have no rate limiting applied. An attacker can execute thousands of credential-stuffing attempts per minute without throttling.
- **Risk Level**: High (Security)
- **Recommendation**: Integrate `express-rate-limit` middleware on `/api/auth/login` (e.g. max 5 failed attempts per IP per 15 minutes) and `/api/auth/register` (max 3 registrations per IP per hour).

### 1.2 Password Reset & Account Recovery
- **Current Behavior**: No password reset or "Forgot Password" mechanism exists. If a user forgets their password, their account is permanently inaccessible unless an administrator manually updates the database hash.
- **Risk Level**: Medium (User Experience)
- **Recommendation**: Plan a password-reset workflow utilizing secure timed reset tokens delivered via transactional email (SendGrid/Resend).

### 1.3 Todo Description Empty String Normalization
- **Current Behavior**: In `server/src/controllers/todos.js`:
  ```javascript
  description ? description.trim() : null
  ```
  If a user passes `""` (empty string), JavaScript truthy check converts it to `null`. However, if they pass a string of spaces `"   "`, `description.trim()` evaluates to `""` (empty string) rather than `null`.
- **Risk Level**: Low (Data Consistency)
- **Recommendation**: Standardize empty strings to `null`:
  ```javascript
  description && description.trim().length > 0 ? description.trim() : null
  ```

### 1.4 Todo Pagination & Volume Safeguards
- **Current Behavior**: `GET /api/todos` queries `SELECT ... FROM todos WHERE user_id = $1 ORDER BY created_at DESC` with no `LIMIT` or pagination. If an active user creates 1,000+ todos, the entire dataset is fetched in a single query and rendered simultaneously into the React DOM.
- **Risk Level**: Medium (Performance / Scalability)
- **Recommendation**: Introduce cursor-based or offset pagination (e.g. `?limit=50&offset=0`).

### 1.5 Account Deletion & GDPR Compliance
- **Current Behavior**: No endpoint exists for users to delete their own account. Although the database schema supports `ON DELETE CASCADE` on `todos.user_id`, this can currently only be triggered by direct SQL execution.
- **Risk Level**: Low (Compliance)
- **Recommendation**: Expose `DELETE /api/auth/me` to allow self-serve account deletion.

---

## 2. Ambiguous Requirements Clarification

| Ambiguity Identified | Verified Code Implementation | QA Standard Adopted |
|---|---|---|
| **Login error granularity** | Returns generic `401 Invalid email or password` for both wrong password and missing user. | **Security Best Practice**: Prevent user enumeration. |
| **Non-existent todo access** | Returns `404 Not Found` whether the ID is missing or belongs to another user. | **Security Best Practice**: Prevent resource existence probing. |
| **Email normalization** | Sanitized to lowercase via `.customSanitizer(v => v.toLowerCase())`. | Case-insensitive uniqueness and login. |
| **Confirm password handling** | Evaluated on client and server before hashing. Not stored in database. | Ephemeral verification field only. |

---

## 3. Duplicate Test Case Analysis
During the test planning phase, test scenarios were evaluated to eliminate redundancy across testing layers:
- **Client vs Server Validation**: While negative validation scenarios (e.g. short name, bad email) are tested at the UI layer, they are also tested directly via the API suite to prove that bypassing client-side validation (via Postman/curl) cannot inject invalid data into the database.
- **CRUD Operations**: The UI suite focuses on user gestures, DOM updates, and optimistic UI rendering, while the API suite focuses on strict HTTP status codes, headers, and JSON response schema validation.
- **Duplication Avoidance**: Redundant boundary tests (e.g. 50 different invalid email permutations) are consolidated into equivalence partitioning classes in the API suite rather than running repetitive heavy browser UI scripts.

---

## 4. Recommended Automation Execution Order

To minimize pipeline duration and provide immediate failure feedback in CI/CD, execute tests in the following order:

```
[Phase 1: Static Analysis]
    └── npm run lint / node --check (0-5s)
[Phase 2: Fast API & Health Smoke Suite]
    └── GET /health, Register, Login, Token checks via Playwright API (<15s)
[Phase 3: Database Integrity Suite]
    └── SQL Constraint & Foreign Key Cascade checks (<10s)
[Phase 4: Full API Regression Suite]
    └── Input validations, Cross-tenant 404 security checks (<30s)
[Phase 5: Playwright UI Automation Suite]
    └── End-to-end browser journeys, DOM validations, Confirm dialogs (~60s)
```
