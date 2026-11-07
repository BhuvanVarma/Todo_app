# Test Scenarios Specification: PERN Todo Application

**Document Version**: 1.0.0
**Author**: Senior QA Engineer / Test Architect
**Structure**: Comprehensive test scenarios categorized across all 13 core modules of the application.

---

## Module 1: User Registration (`REG`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-REG-01` | Verify successful user registration with valid name, email, password, and matching confirm password. | Positive / Smoke | Functional Happy Path |
| `SC-REG-02` | Verify registration rejection when mandatory fields are omitted or empty. | Negative | Field Presence Validation |
| `SC-REG-03` | Verify registration boundary validation for Name length (1 char, 2 chars, 50 chars, 51 chars). | Boundary Value Analysis | Min/Max Field Boundaries |
| `SC-REG-04` | Verify registration rejection for malformed email addresses. | Negative / Equivalence | Regex Format Validation |
| `SC-REG-05` | Verify email case-normalization during registration (uppercase/mixed-case stored lowercase). | Functional / Data Integrity | Email Sanitization |
| `SC-REG-06` | Verify registration rejection when email is already registered (Conflict handling). | Negative / Security | 409 Conflict Handling |
| `SC-REG-07` | Verify password boundary and complexity validation (<8 chars, >72 chars, letters only, numbers only). | Boundary & Equivalence | Password Security Policy |
| `SC-REG-08` | Verify registration rejection when Password and Confirm Password do not match. | Negative | Confirmation Matching |
| `SC-REG-09` | Verify input trimming for Name and Email fields on submission. | Functional / Sanitization | Leading/Trailing Whitespace |
| `SC-REG-10` | Verify submit button disabling and loading spinner state while registration request is in flight. | Functional UI | Double-Submit Prevention |

---

## Module 2: User Login (`LOGIN`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-LOG-01` | Verify successful user login with valid registered email and correct password. | Positive / Smoke | Happy Path Authentication |
| `SC-LOG-02` | Verify login rejection when email or password fields are left empty. | Negative | Required Field Check |
| `SC-LOG-03` | Verify login rejection for non-existent email address with generic error message. | Negative / Security | User Enumeration Prevention |
| `SC-LOG-04` | Verify login rejection for valid email with incorrect password with generic error message. | Negative / Security | Credential Verification |
| `SC-LOG-05` | Verify login handles case-insensitive email matching (e.g., registered as lowercase, login with uppercase). | Functional | Email Normalization |
| `SC-LOG-06` | Verify submit button disabling and loading spinner state during login request processing. | Functional UI | Request Debouncing |
| `SC-LOG-07` | Verify navigation link to `/register` redirects visitor smoothly. | Functional UI | Seamless Navigation |

---

## Module 3: Authentication & Session Management (`AUTH`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-AUT-01` | Verify `token` cookie attributes upon successful login/registration (`httpOnly`, `SameSite`, `MaxAge`). | Security / Integration | Cookie Security Policy |
| `SC-AUT-02` | Verify access to protected dashboard `/todos` when valid session cookie exists. | Positive / Functional | Route Authorization |
| `SC-AUT-03` | Verify immediate redirect to `/login` when unauthenticated visitor navigates directly to `/todos`. | Security / Negative | Protected Route Guard |
| `SC-AUT-04` | Verify session preservation upon hard page reload (`F5`) on `/todos`. | Integration / State | Session Hydration |
| `SC-AUT-05` | Verify client-side optimization skips `/api/auth/me` call when `pern_todo_session` flag is absent. | Performance / UI | Console 401 Suppression |
| `SC-AUT-06` | Verify expired or forged JWT cookie results in 401 Unauthorized, flag purging, and redirect to `/login`. | Security / Negative | Token Tampering / Expiry |
| `SC-AUT-07` | Verify wildcard route (`/*`) redirects unauthenticated users to `/login`. | Functional / Routing | Fallback Routing |

---

## Module 4: User Logout (`LOGOUT`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-OUT-01` | Verify successful logout by clicking `Logout` button in Navbar. | Positive / Smoke | Functional Logout |
| `SC-OUT-02` | Verify `token` cookie is cleared from browser on logout. | Security / Integration | Cookie Invalidation |
| `SC-OUT-03` | Verify `pern_todo_session` flag is removed from `localStorage` on logout. | Integration / State | Local State Cleanup |
| `SC-OUT-04` | Verify that clicking browser Back button after logout does not allow accessing private todos. | Security / Functional | History Navigation Guard |

---

## Module 5: Todo Creation (`TODO-CREATE`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-TCR-01` | Verify creating a todo with valid title only (description omitted). | Positive / Smoke | Minimal Creation |
| `SC-TCR-02` | Verify creating a todo with valid title and optional description. | Positive | Full Field Creation |
| `SC-TCR-03` | Verify description textarea toggle functionality (`+ Add description` / `– Hide description`). | Functional UI | Dynamic Form State |
| `SC-TCR-04` | Verify todo creation rejection when title is empty or consists purely of whitespace. | Negative / Boundary | Title Mandatory Rule |
| `SC-TCR-05` | Verify todo title length boundary validation (1 char, 100 chars, 101 chars). | Boundary Value Analysis | Title Upper Limit |
| `SC-TCR-06` | Verify description length boundary validation (500 chars, 501 chars). | Boundary Value Analysis | Description Upper Limit |
| `SC-TCR-07` | Verify newly created todo immediately prepends to the top of the UI list without manual reload. | Functional / UI | Optimistic UI Prepending |
| `SC-TCR-08` | Verify form input fields reset to empty and description collapses after successful creation. | Functional UI | Form Lifecycle Reset |

---

## Module 6: Todo Listing and Retrieval (`TODO-LIST`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-TLI-01` | Verify loading state (`Loading todos…` with spinner) is displayed while fetching todos. | Functional UI | Asynchronous Feedback |
| `SC-TLI-02` | Verify empty state (`No todos yet — add one above! 👆`) is displayed when user has zero todos. | Functional UI | Zero-Data Rendering |
| `SC-TLI-03` | Verify todos are rendered in reverse chronological order (`created_at DESC`). | Functional / Database | Correct Sorting Order |
| `SC-TLI-04` | Verify that long title and description text wrap cleanly without breaking card layout. | Exploratory / UI | Word-Break & CSS Layout |
| `SC-TLI-05` | Verify error state and `Retry` button behavior when `GET /api/todos` fails (e.g. network failure). | Resilience / Negative | Fetch Error Recovery |

---

## Module 7: Todo Updating (`TODO-UPDATE`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-TUP-01` | Verify clicking edit button (`✏️`) displays the inline edit form pre-populated with current values. | Functional UI | Edit Mode Invocation |
| `SC-TUP-02` | Verify clicking `Cancel` in edit mode closes form and discards unsaved modifications. | Functional UI | Edit Mode Cancellation |
| `SC-TUP-03` | Verify successfully updating both title and description persists to database and updates DOM. | Positive / Functional | Full Field Modification |
| `SC-TUP-04` | Verify updating title to empty or whitespace is rejected with validation error. | Negative / Boundary | Inline Validation Guard |
| `SC-TUP-05` | Verify saving state disables the `Save` button and displays a progress spinner. | Functional UI | Save In-Flight Handling |
| `SC-TUP-06` | Verify updating description to empty string converts it to `null` in the database. | Data Integrity | Nullable Field Handling |

---

## Module 8: Todo Completion & Reopening (`TODO-TOGGLE`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-TTG-01` | Verify checking an uncompleted todo toggles `is_completed` to `true` and applies strike-through styling. | Positive / Functional | Complete State Transition |
| `SC-TTG-02` | Verify unchecking a completed todo toggles `is_completed` to `false` and removes strike-through styling. | Positive / Functional | Reopen State Transition |
| `SC-TTG-03` | Verify persistent toggle state across page reloads. | Integration / Database | Persistence Verification |
| `SC-TTG-04` | Verify action error banner appears if toggle operation fails over the network. | Resilience / Negative | Error Feedback |

---

## Module 9: Todo Deletion (`TODO-DELETE`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-TDL-01` | Verify clicking delete button (`🗑️`) triggers browser confirmation dialogue (`Delete this todo?`). | Functional UI | Destructive Action Prompt |
| `SC-TDL-02` | Verify cancelling the confirmation dialogue leaves the todo intact in UI and database. | Positive / Functional | Deletion Cancellation |
| `SC-TDL-03` | Verify accepting the confirmation dialogue deletes the todo from database and removes it from DOM. | Positive / Smoke | Successful Removal |
| `SC-TDL-04` | Verify list displays empty state if the only remaining todo is deleted. | Functional UI | State Transition to Empty |
| `SC-TDL-05` | Verify action error banner displays if deletion request fails on server. | Resilience / Negative | Deletion Error Handling |

---

## Module 10: Multi-Tenant User Data Isolation (`DATA-ISOLATION`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-ISO-01` | Verify User A cannot see User B's todos in `GET /api/todos`. | Security / Negative | Read Data Leak Prevention |
| `SC-ISO-02` | Verify User A cannot update User B's todo by sending `PUT /api/todos/:id` with User B's todo ID. | Security / Negative | Unauthorized Modification |
| `SC-ISO-03` | Verify User A cannot toggle User B's todo by sending `PATCH /api/todos/:id/toggle` with User B's todo ID. | Security / Negative | Unauthorized State Change |
| `SC-ISO-04` | Verify User A cannot delete User B's todo by sending `DELETE /api/todos/:id` with User B's todo ID. | Security / Negative | Unauthorized Deletion |
| `SC-ISO-05` | Verify server returns 404 Not Found (not 403) when accessing foreign todos to prevent ID probing. | Security / Info Disclosure | Resource Existence Hiding |

---

## Module 11: UI Validations & Feedback (`UI-VALIDATION`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-UIV-01` | Verify real-time clearance of field validation error when user begins typing in that input. | Functional UI | Error Recovery UX |
| `SC-UIV-02` | Verify client-side prevention of form submission when client validation fails (zero network requests). | Functional UI | Network Call Throttling |
| `SC-UIV-03` | Verify server validation errors map correctly to inline input errors when received from API. | Functional / Integration | Error Response Mapping |
| `SC-UIV-04` | Verify generic server errors (e.g. database down, 500) render inside a prominent red alert banner. | Functional UI | Global Alert Visibility |
| `SC-UIV-05` | Verify `maxLength` HTML attribute prevents typing beyond allowed limits in inputs and textareas. | Boundary UI | Hard Character Caps |

---

## Module 12: API Error Handling & Contracts (`API-ERROR`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-ERR-01` | Verify API error response format consistency (`{ "errors": [{ "field": "...", "message": "..." }] }`). | Integration / Contract | Uniform Error Schema |
| `SC-ERR-02` | Verify API returns 400 Bad Request with structured field errors on invalid payloads. | Contract / Negative | Validation Response Code |
| `SC-ERR-03` | Verify API returns 401 Unauthorized with `{ errors: [{ message: "Not authenticated" }] }` without cookie. | Security / Contract | Missing Credential Response |
| `SC-ERR-04` | Verify API returns 404 Not Found with custom JSON for non-existent routes (`GET /api/unknown`). | Contract / Negative | Central 404 Route Handler |
| `SC-ERR-05` | Verify API returns 400 when `:id` route parameter is not a positive integer (e.g., `abc`, `-5`, `0`). | Contract / Validation | Route Parameter Validation |
| `SC-ERR-06` | Verify Central Error Handler prevents stack trace leakage when unexpected runtime exception occurs. | Security / Resilience | 500 Information Concealment |

---

## Module 13: Database Consistency & Integrity (`DB-INTEGRITY`)

| Scenario ID | Scenario Description | Testing Technique | Focus |
|---|---|---|---|
| `SC-DBI-01` | Verify `CHECK` constraint on `users(name)` rejects names shorter than 2 non-whitespace characters. | Database Constraint | DB-Level Name Validation |
| `SC-DBI-02` | Verify `UNIQUE` constraint on `users(email)` rejects duplicate email entries at database level. | Database Constraint | DB-Level Email Uniqueness |
| `SC-DBI-03` | Verify `CHECK` constraint on `todos(title)` rejects empty or all-whitespace strings at database level. | Database Constraint | DB-Level Title Validation |
| `SC-DBI-04` | Verify foreign key cascade: deleting a user deletes all associated todos in `todos` table. | Database Cascade | Cascade Delete Integrity |
| `SC-DBI-05` | Verify default values: `is_completed` defaults to `false`, `created_at` defaults to current timestamp. | Database Defaults | Default Column Attributes |
| `SC-DBI-06` | Verify index `todos_user_id_idx` is utilized when executing user-scoped queries. | Database Performance | Query Index Verification |
