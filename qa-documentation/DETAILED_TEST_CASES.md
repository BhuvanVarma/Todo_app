# Detailed Test Cases: PERN Todo Application

**Document Version**: 1.0.0
**Author**: Senior QA Engineer / Test Architect
**Structure**: Complete test cases with preconditions, step-by-step instructions, test data, expected outcomes, priority, and automation feasibility.

---

## 1. Registration Module (`REG`)

### TC-REG-001: Successful User Registration
- **Module**: Registration
- **Test Scenario**: `SC-REG-01`
- **Test Case Title**: Verify successful registration with valid inputs and auto-navigation to `/todos`.
- **Preconditions**: User is on `http://localhost:5173/register`. No active user session exists.
- **Test Steps**:
  1. Enter a valid name in `Name` input (`input#name`).
  2. Enter a unique, valid email in `Email` input (`input#email`).
  3. Enter a compliant password in `Password` input (`input#password`).
  4. Enter the identical password in `Confirm Password` input (`input#confirmPassword`).
  5. Click `Create account` button (`button[type="submit"]`).
- **Test Data**:
  - `name`: `Alice Tester`
  - `email`: `alice_reg_{TIMESTAMP}@example.com`
  - `password`: `Passw0rd123`
  - `confirmPassword`: `Passw0rd123`
- **Expected Result**:
  - Request `POST /api/auth/register` completes with HTTP 201 Created.
  - Browser sets `token` httpOnly cookie.
  - `localStorage` key `pern_todo_session` is set to `"1"`.
  - App redirects to `http://localhost:5173/todos`.
  - Navbar renders `Hi, Alice Tester` and `Logout` button.
- **Priority**: Critical
- **Test Type**: UI / Integration
- **Automation Suitability**: Yes

---

### TC-REG-002: Registration Rejection on Empty Fields
- **Module**: Registration
- **Test Scenario**: `SC-REG-02`
- **Test Case Title**: Verify inline error messages when submitting an empty registration form.
- **Preconditions**: User is on `http://localhost:5173/register`.
- **Test Steps**:
  1. Leave all inputs completely empty.
  2. Click `Create account` button.
- **Test Data**: All fields blank (`""`).
- **Expected Result**:
  - Form is prevented from submission (no network request made).
  - Under `Name`: `p.field-error` displays `Name is required`.
  - Under `Email`: `p.field-error` displays `Email is required`.
  - Under `Password`: `p.field-error` displays `Password is required`.
  - Under `Confirm Password`: `p.field-error` displays `Please confirm your password`.
  - Inputs receive red error border (`.error`).
- **Priority**: High
- **Test Type**: UI
- **Automation Suitability**: Yes

---

### TC-REG-003: Name Minimum Boundary Validation (1 Char vs 2 Chars)
- **Module**: Registration
- **Test Scenario**: `SC-REG-03`
- **Test Case Title**: Verify rejection of 1-character name and acceptance of 2-character name.
- **Preconditions**: User is on `http://localhost:5173/register`.
- **Test Steps**:
  1. Enter `A` (1 char) in `Name`. Fill valid email and password. Click `Create account`.
  2. Verify error message appears.
  3. Change `Name` to `Al` (2 chars). Click `Create account`.
- **Test Data**:
  - Case 1: `name`: `A`, `email`: `valid1@example.com`, `password`: `Password123`
  - Case 2: `name`: `Al`, `email`: `valid2@example.com`, `password`: `Password123`
- **Expected Result**:
  - Step 2: Form blocked. `p.field-error` displays `Name must be 2–50 characters`.
  - Step 3: Validation passes, registration completes successfully.
- **Priority**: High
- **Test Type**: UI / Boundary
- **Automation Suitability**: Yes

---

### TC-REG-004: Name Maximum Boundary (50 chars vs 51 chars)
- **Module**: Registration
- **Test Scenario**: `SC-REG-03`
- **Test Case Title**: Verify name field enforces maximum length of 50 characters.
- **Preconditions**: User is on `http://localhost:5173/register`.
- **Test Steps**:
  1. Attempt to type a 51-character string into `Name` input.
  2. Observe characters entered.
- **Test Data**: `A` repeated 51 times (`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`).
- **Expected Result**:
  - The HTML attribute `maxLength="50"` truncates input at exactly 50 characters. 51st character is not accepted.
- **Priority**: Medium
- **Test Type**: UI / Boundary
- **Automation Suitability**: Yes

---

### TC-REG-005: Invalid Email Format Rejection
- **Module**: Registration
- **Test Scenario**: `SC-REG-04`
- **Test Case Title**: Verify registration fails when entering malformed email strings.
- **Preconditions**: User is on `http://localhost:5173/register`.
- **Test Steps**:
  1. Fill `Name`: `Bob Tester`, `Password`: `Password123`, `Confirm Password`: `Password123`.
  2. Enter invalid email formats one by one:
     - `plainaddress`
     - `missingatsign.com`
     - `@missingusername.com`
     - `user@.domain.com`
  3. Click `Create account` for each.
- **Test Data**: Malformed email strings above.
- **Expected Result**:
  - For each malformed email, submission is blocked.
  - `p.field-error` under email displays `Invalid email format`.
- **Priority**: High
- **Test Type**: UI / Equivalence
- **Automation Suitability**: Yes

---

### TC-REG-006: Duplicate Email Registration (409 Conflict)
- **Module**: Registration
- **Test Scenario**: `SC-REG-06`
- **Test Case Title**: Verify server returns 409 and UI displays alert when registering an existing email.
- **Preconditions**: A user with email `existing_user@example.com` is already registered in database.
- **Test Steps**:
  1. Navigate to `/register`.
  2. Fill `Name`: `Clone User`.
  3. Fill `Email`: `existing_user@example.com`.
  4. Fill `Password`: `Password123` and `Confirm Password`: `Password123`.
  5. Click `Create account`.
- **Test Data**: `email`: `existing_user@example.com`.
- **Expected Result**:
  - API returns HTTP 409 Conflict with `{ "errors": [{ "field": "email", "message": "Email already in use" }] }`.
  - UI displays error message `Email already in use` under the email input.
  - User remains on `/register` page; no session is created.
- **Priority**: Critical
- **Test Type**: UI / API / Integration
- **Automation Suitability**: Yes

---

### TC-REG-007: Password Complexity Validation
- **Module**: Registration
- **Test Scenario**: `SC-REG-07`
- **Test Case Title**: Verify password requires minimum 8 characters, at least 1 letter, and at least 1 number.
- **Preconditions**: User is on `http://localhost:5173/register`.
- **Test Steps**:
  1. Test Password `short1` (6 chars): Click `Create account`.
  2. Test Password `onlyletters` (11 chars, no digits): Click `Create account`.
  3. Test Password `1234567890` (10 chars, no letters): Click `Create account`.
- **Test Data**:
  - Case 1: `short1` -> Expect `Password must be 8–72 characters`.
  - Case 2: `onlyletters` -> Expect `Password must contain at least one number`.
  - Case 3: `1234567890` -> Expect `Password must contain at least one letter`.
- **Expected Result**: Appropriate inline validation error is displayed for each non-compliant password.
- **Priority**: High
- **Test Type**: UI / Boundary
- **Automation Suitability**: Yes

---

### TC-REG-008: Password and Confirm Password Mismatch
- **Module**: Registration
- **Test Scenario**: `SC-REG-08`
- **Test Case Title**: Verify rejection when confirm password does not match password.
- **Preconditions**: User is on `http://localhost:5173/register`.
- **Test Steps**:
  1. Fill valid `Name` and `Email`.
  2. Enter `Password`: `Password123`.
  3. Enter `Confirm Password`: `Password999`.
  4. Click `Create account`.
- **Test Data**: `password`: `Password123`, `confirmPassword`: `Password999`.
- **Expected Result**:
  - Form submission is blocked.
  - Under `Confirm Password`: `p.field-error` displays `Passwords do not match`.
- **Priority**: High
- **Test Type**: UI
- **Automation Suitability**: Yes

---

## 2. Login Module (`LOGIN`)

### TC-LOG-001: Successful User Login
- **Module**: Login
- **Test Scenario**: `SC-LOG-01`
- **Test Case Title**: Verify successful login with registered credentials navigates to `/todos`.
- **Preconditions**: User `testuser@example.com` with password `Password123` exists. User is on `/login`.
- **Test Steps**:
  1. Enter `testuser@example.com` in `Email` input.
  2. Enter `Password123` in `Password` input.
  3. Click `Log in` button.
- **Test Data**: `email`: `testuser@example.com`, `password`: `Password123`.
- **Expected Result**:
  - API `POST /api/auth/login` returns HTTP 200 OK with user object.
  - `token` httpOnly cookie is set.
  - `pern_todo_session` is set to `"1"` in `localStorage`.
  - Browser navigates to `/todos`.
  - Navbar displays user's name.
- **Priority**: Critical
- **Test Type**: UI / Smoke
- **Automation Suitability**: Yes

---

### TC-LOG-002: Login Rejection on Blank Fields
- **Module**: Login
- **Test Scenario**: `SC-LOG-02`
- **Test Case Title**: Verify inline error messages when submitting blank login form.
- **Preconditions**: User is on `/login`.
- **Test Steps**:
  1. Leave email and password blank.
  2. Click `Log in`.
- **Test Data**: Both fields empty.
- **Expected Result**:
  - Under `Email`: `Email is required`.
  - Under `Password`: `Password is required`.
  - No HTTP request is sent.
- **Priority**: High
- **Test Type**: UI
- **Automation Suitability**: Yes

---

### TC-LOG-003: Login with Invalid Password (Generic Error)
- **Module**: Login
- **Test Scenario**: `SC-LOG-04`
- **Test Case Title**: Verify server returns generic 401 alert on incorrect password without leaking field details.
- **Preconditions**: Registered user `testuser@example.com` exists. User is on `/login`.
- **Test Steps**:
  1. Enter `testuser@example.com` in `Email`.
  2. Enter `WrongPassword99` in `Password`.
  3. Click `Log in`.
- **Test Data**: `email`: `testuser@example.com`, `password`: `WrongPassword99`.
- **Expected Result**:
  - API returns HTTP 401 Unauthorized with `{ "errors": [{ "message": "Invalid email or password" }] }`.
  - Top alert banner (`div.alert.alert-error`) displays `Invalid email or password`.
  - No cookie is issued. User remains on `/login`.
- **Priority**: Critical
- **Test Type**: UI / Security
- **Automation Suitability**: Yes

---

### TC-LOG-004: Login with Non-Existent Email (Generic Error)
- **Module**: Login
- **Test Scenario**: `SC-LOG-03`
- **Test Case Title**: Verify server returns generic 401 alert on non-existent email (prevents user enumeration).
- **Preconditions**: Email `nonexistent_user_99@example.com` does not exist in database. User is on `/login`.
- **Test Steps**:
  1. Enter `nonexistent_user_99@example.com` in `Email`.
  2. Enter `AnyPassword123` in `Password`.
  3. Click `Log in`.
- **Test Data**: `email`: `nonexistent_user_99@example.com`, `password`: `AnyPassword123`.
- **Expected Result**:
  - Response is identical to wrong password: HTTP 401 with `Invalid email or password`.
  - No hint given whether email exists or not.
- **Priority**: Critical
- **Test Type**: UI / Security
- **Automation Suitability**: Yes

---

### TC-LOG-005: Case-Insensitive Email Login Normalization
- **Module**: Login
- **Test Scenario**: `SC-LOG-05`
- **Test Case Title**: Verify user registered with lowercase email can log in using uppercase email letters.
- **Preconditions**: User registered as `john.doe@example.com`.
- **Test Steps**:
  1. Navigate to `/login`.
  2. Enter `JOHN.DOE@EXAMPLE.COM` in `Email`.
  3. Enter correct password `Password123`.
  4. Click `Log in`.
- **Test Data**: `email`: `JOHN.DOE@EXAMPLE.COM`.
- **Expected Result**:
  - Client and server sanitize email to lowercase.
  - User successfully logs in and enters `/todos`.
- **Priority**: Medium
- **Test Type**: UI / Functional
- **Automation Suitability**: Yes

---

## 3. Authentication & Session Management Module (`AUTH`)

### TC-AUT-001: Protected Route Guard (`/todos` Direct Access)
- **Module**: Auth
- **Test Scenario**: `SC-AUT-03`
- **Test Case Title**: Verify unauthenticated user navigating directly to `/todos` is redirected to `/login`.
- **Preconditions**: Browser context has no `token` cookie and no `pern_todo_session` in `localStorage`.
- **Test Steps**:
  1. Open browser and navigate directly to `http://localhost:5173/todos`.
- **Test Data**: None.
- **Expected Result**:
  - `<ProtectedRoute>` evaluates `user === null`.
  - Browser URL immediately changes to `http://localhost:5173/login`.
  - Todos page contents are never rendered.
- **Priority**: Critical
- **Test Type**: UI / Security
- **Automation Suitability**: Yes

---

### TC-AUT-002: Session Persistence Across Page Refresh
- **Module**: Auth
- **Test Scenario**: `SC-AUT-04`
- **Test Case Title**: Verify refreshing the page on `/todos` maintains user authentication without re-login.
- **Preconditions**: User is logged in and viewing `/todos`.
- **Test Steps**:
  1. Refresh the page (`F5` or `location.reload()`).
  2. Observe the page state.
- **Test Data**: Active authenticated session.
- **Expected Result**:
  - `AuthContext` sees `pern_todo_session` in `localStorage`.
  - Dispatches `GET /api/auth/me`.
  - Server verifies `token` cookie and returns user data (200 OK).
  - Page renders `/todos` with user's greeting in Navbar. No redirect to `/login`.
- **Priority**: Critical
- **Test Type**: UI / Integration
- **Automation Suitability**: Yes

---

### TC-AUT-003: Cookie Security Attributes Verification
- **Module**: Auth
- **Test Scenario**: `SC-AUT-01`
- **Test Case Title**: Verify `Set-Cookie` header includes `HttpOnly`, `Path=/`, and appropriate `SameSite` flags.
- **Preconditions**: User performs login or registration via API.
- **Test Steps**:
  1. Send `POST /api/auth/login` with valid credentials.
  2. Inspect response `Set-Cookie` header.
- **Test Data**: Valid user credentials.
- **Expected Result**:
  - Header contains `token=<JWT>; Max-Age=604800; Path=/; HttpOnly; SameSite=lax` (or `SameSite=none; Secure` in production).
  - Cookie cannot be accessed via `document.cookie` in browser console.
- **Priority**: Critical
- **Test Type**: API / Security
- **Automation Suitability**: Yes

---

## 4. Logout Module (`LOGOUT`)

### TC-OUT-001: User Logout Execution
- **Module**: Logout
- **Test Scenario**: `SC-OUT-01`, `SC-OUT-02`, `SC-OUT-03`
- **Test Case Title**: Verify clicking `Logout` clears session, removes cookie, and redirects to `/login`.
- **Preconditions**: User is logged in on `/todos`.
- **Test Steps**:
  1. Click `Logout` button in Navbar.
- **Test Data**: None.
- **Expected Result**:
  - `POST /api/auth/logout` is dispatched and returns HTTP 200 `{ "message": "Logged out" }`.
  - `token` cookie is cleared (expiry set to past).
  - `pern_todo_session` is removed from `localStorage`.
  - UI updates user state to `null`.
  - App redirects to `http://localhost:5173/login`.
- **Priority**: Critical
- **Test Type**: UI / Smoke
- **Automation Suitability**: Yes

---

### TC-OUT-002: Prevent Access via Browser Back Button Post-Logout
- **Module**: Logout
- **Test Scenario**: `SC-OUT-04`
- **Test Case Title**: Verify clicking browser Back button after logout does not allow viewing or editing todos.
- **Preconditions**: User logged out in `TC-OUT-001` and is currently on `/login`.
- **Test Steps**:
  1. Click the browser Back button.
- **Test Data**: None.
- **Expected Result**:
  - Router intercepts `/todos` navigation.
  - Because `user === null` and no session exists, user is immediately redirected back to `/login`.
- **Priority**: High
- **Test Type**: UI / Security
- **Automation Suitability**: Yes

---

## 5. Todo Creation Module (`TODO-CREATE`)

### TC-TCR-001: Create Todo with Title Only
- **Module**: Todo Creation
- **Test Scenario**: `SC-TCR-01`
- **Test Case Title**: Verify creating a todo item with title only (no description).
- **Preconditions**: User logged in on `/todos`.
- **Test Steps**:
  1. Enter `Buy organic milk` into `input[placeholder="What do you need to do?"]`.
  2. Ensure description field is hidden.
  3. Click `Add` button.
- **Test Data**: `title`: `Buy organic milk`.
- **Expected Result**:
  - `POST /api/todos` returns 201 Created with `{ todo: { id, title: "Buy organic milk", description: null, is_completed: false, ... } }`.
  - New todo item appears at the top of the list with unchecked box and title.
  - Input field is cleared.
- **Priority**: Critical
- **Test Type**: UI / Smoke
- **Automation Suitability**: Yes

---

### TC-TCR-002: Create Todo with Title and Description
- **Module**: Todo Creation
- **Test Scenario**: `SC-TCR-02`, `SC-TCR-03`
- **Test Case Title**: Verify creating a todo item with both title and description.
- **Preconditions**: User logged in on `/todos`.
- **Test Steps**:
  1. Enter `Renew Car Insurance` in title input.
  2. Click `+ Add description` button.
  3. Verify textarea appears with placeholder `Optional description…`.
  4. Enter `Policy expires on the 15th. Check comprehensive coverage options.` in textarea.
  5. Click `Add` button.
- **Test Data**:
  - `title`: `Renew Car Insurance`
  - `description`: `Policy expires on the 15th. Check comprehensive coverage options.`
- **Expected Result**:
  - `POST /api/todos` returns 201 Created.
  - Item prepends to list displaying title and description text.
  - Description textarea collapses, toggle resets to `+ Add description`, form fields reset.
- **Priority**: High
- **Test Type**: UI / Functional
- **Automation Suitability**: Yes

---

### TC-TCR-003: Todo Title Blank & Whitespace-Only Validation
- **Module**: Todo Creation
- **Test Scenario**: `SC-TCR-04`
- **Test Case Title**: Verify creating a todo with empty or whitespace-only title is rejected.
- **Preconditions**: User logged in on `/todos`.
- **Test Steps**:
  1. Enter `   ` (spaces only) in title input.
  2. Click `Add` button.
- **Test Data**: `title`: `   `.
- **Expected Result**:
  - Client prevents submission (no network request).
  - `p.field-error` under title displays `Title is required`.
  - Title input receives `.error` border.
- **Priority**: High
- **Test Type**: UI / Boundary
- **Automation Suitability**: Yes

---

### TC-TCR-004: Todo Title Boundary Validation (100 vs 101 Chars)
- **Module**: Todo Creation
- **Test Scenario**: `SC-TCR-05`
- **Test Case Title**: Verify title input enforces 100 character maximum limit.
- **Preconditions**: User logged in on `/todos`.
- **Test Steps**:
  1. Attempt to enter 101 characters into title input.
- **Test Data**: String of 101 characters (`T` repeated 101 times).
- **Expected Result**:
  - `maxLength="100"` prevents typing past 100 characters. Input value is clamped at 100 chars.
- **Priority**: Medium
- **Test Type**: UI / Boundary
- **Automation Suitability**: Yes

---

### TC-TCR-005: Todo Description Boundary Validation (500 vs 501 Chars)
- **Module**: Todo Creation
- **Test Scenario**: `SC-TCR-06`
- **Test Case Title**: Verify description textarea enforces 500 character maximum limit.
- **Preconditions**: User logged in on `/todos`. Description textarea open.
- **Test Steps**:
  1. Attempt to enter 501 characters into description textarea.
- **Test Data**: String of 501 characters (`D` repeated 501 times).
- **Expected Result**:
  - `maxLength="500"` on `<textarea>` prevents typing past 500 characters.
- **Priority**: Medium
- **Test Type**: UI / Boundary
- **Automation Suitability**: Yes

---

## 6. Todo Listing Module (`TODO-LIST`)

### TC-TLI-001: Empty List State Rendering
- **Module**: Todo Listing
- **Test Scenario**: `SC-TLI-02`
- **Test Case Title**: Verify empty state placeholder is displayed when user has no todos.
- **Preconditions**: Newly registered user with 0 todos is on `/todos`.
- **Test Steps**:
  1. Observe the container below the add-todo card.
- **Test Data**: User with 0 todos.
- **Expected Result**:
  - Element `.state-msg` renders text: `No todos yet — add one above! 👆`.
  - No `.todo-item` elements exist in DOM.
- **Priority**: Medium
- **Test Type**: UI
- **Automation Suitability**: Yes

---

### TC-TLI-002: Reverse Chronological Sorting Verification
- **Module**: Todo Listing
- **Test Scenario**: `SC-TLI-03`
- **Test Case Title**: Verify multiple todos are listed newest-to-oldest based on `created_at`.
- **Preconditions**: User logged in on `/todos`.
- **Test Steps**:
  1. Create Todo 1: `First Task`.
  2. Wait 1 second. Create Todo 2: `Second Task`.
  3. Wait 1 second. Create Todo 3: `Third Task`.
  4. Inspect the order of items in `.todo-list`.
- **Test Data**: Three sequential todos.
- **Expected Result**:
  - Top item is `Third Task`.
  - Middle item is `Second Task`.
  - Bottom item is `First Task`.
- **Priority**: High
- **Test Type**: UI / Functional
- **Automation Suitability**: Yes

---

## 7. Todo Updating Module (`TODO-UPDATE`)

### TC-TUP-001: Enter and Cancel Inline Edit Mode
- **Module**: Todo Updating
- **Test Scenario**: `SC-TUP-01`, `SC-TUP-02`
- **Test Case Title**: Verify clicking edit button opens inline form and `Cancel` discards edits.
- **Preconditions**: User has todo `Original Title` with description `Original Desc`.
- **Test Steps**:
  1. Click edit button (`✏️`) on the todo item.
  2. Verify form `.edit-form` appears with fields pre-populated.
  3. Change title to `Modified Title`.
  4. Click `Cancel` button.
- **Test Data**: Modified text `Modified Title`.
- **Expected Result**:
  - Edit form closes.
  - Todo displays `Original Title` and `Original Desc`.
  - No network request is dispatched.
- **Priority**: High
- **Test Type**: UI / Functional
- **Automation Suitability**: Yes

---

### TC-TUP-002: Save Inline Edit Modifications
- **Module**: Todo Updating
- **Test Scenario**: `SC-TUP-03`
- **Test Case Title**: Verify saving edited title and description updates database and UI.
- **Preconditions**: User has existing todo on `/todos`.
- **Test Steps**:
  1. Click edit button (`✏️`).
  2. Change title to `Clean garage updated`.
  3. Change description to `Organize tool bench and discard recycling`.
  4. Click `Save` button.
- **Test Data**:
  - `title`: `Clean garage updated`
  - `description`: `Organize tool bench and discard recycling`
- **Expected Result**:
  - `PUT /api/todos/:id` returns 200 OK with updated todo object.
  - Inline edit form closes.
  - Item updates in list with new title and description.
- **Priority**: Critical
- **Test Type**: UI / Functional
- **Automation Suitability**: Yes

---

### TC-TUP-003: Inline Edit Title Empty Validation
- **Module**: Todo Updating
- **Test Scenario**: `SC-TUP-04`
- **Test Case Title**: Verify attempting to save an empty title in edit mode displays validation error.
- **Preconditions**: Todo in edit mode.
- **Test Steps**:
  1. Clear the title input in `.edit-form`.
  2. Click `Save`.
- **Test Data**: `title`: `""`.
- **Expected Result**:
  - Form submission blocked.
  - `p.field-error` under title displays `Title is required`.
  - Edit form remains open.
- **Priority**: High
- **Test Type**: UI / Boundary
- **Automation Suitability**: Yes

---

## 8. Todo Completion & Reopening Module (`TODO-TOGGLE`)

### TC-TTG-001: Toggle Todo to Complete
- **Module**: Todo Completion
- **Test Scenario**: `SC-TTG-01`
- **Test Case Title**: Verify checking uncompleted todo sets `is_completed=true` and applies strikethrough.
- **Preconditions**: An active, uncompleted todo exists on `/todos`.
- **Test Steps**:
  1. Click the checkbox (`input.todo-checkbox`) on the todo item.
- **Test Data**: Target uncompleted todo.
- **Expected Result**:
  - `PATCH /api/todos/:id/toggle` returns 200 OK with `is_completed: true`.
  - Checkbox becomes checked.
  - Parent element `.todo-item` gains class `.completed`.
  - Title text receives `line-through` CSS styling.
- **Priority**: Critical
- **Test Type**: UI / Functional
- **Automation Suitability**: Yes

---

### TC-TTG-002: Toggle Completed Todo to Incomplete (Reopen)
- **Module**: Todo Completion
- **Test Scenario**: `SC-TTG-02`
- **Test Case Title**: Verify unchecking a completed todo reopens it and removes strikethrough styling.
- **Preconditions**: A completed todo exists on `/todos`.
- **Test Steps**:
  1. Click the checked checkbox on the completed todo item.
- **Test Data**: Target completed todo.
- **Expected Result**:
  - `PATCH /api/todos/:id/toggle` returns 200 OK with `is_completed: false`.
  - Checkbox becomes unchecked.
  - Parent `.todo-item` loses class `.completed`.
  - Strikethrough style is removed.
- **Priority**: High
- **Test Type**: UI / Functional
- **Automation Suitability**: Yes

---

## 9. Todo Deletion Module (`TODO-DELETE`)

### TC-TDL-001: Cancel Todo Deletion Dialogue
- **Module**: Todo Deletion
- **Test Scenario**: `SC-TDL-01`, `SC-TDL-02`
- **Test Case Title**: Verify dismissing the browser confirm dialogue cancels deletion.
- **Preconditions**: Todo exists on `/todos`.
- **Test Steps**:
  1. Click delete button (`🗑️`).
  2. Browser displays native dialog `Delete this todo?`.
  3. Dismiss / Cancel the dialog (`dialog.dismiss()`).
- **Test Data**: None.
- **Expected Result**:
  - Dialog closes.
  - No `DELETE` HTTP request is sent.
  - Todo remains visible in the list.
- **Priority**: High
- **Test Type**: UI / Functional
- **Automation Suitability**: Yes

---

### TC-TDL-002: Confirm and Complete Todo Deletion
- **Module**: Todo Deletion
- **Test Scenario**: `SC-TDL-03`
- **Test Case Title**: Verify accepting the browser confirm dialogue deletes the todo.
- **Preconditions**: Todo exists on `/todos`.
- **Test Steps**:
  1. Click delete button (`🗑️`).
  2. Accept the confirmation dialogue (`dialog.accept()`).
- **Test Data**: Target todo ID.
- **Expected Result**:
  - `DELETE /api/todos/:id` returns 200 OK with `{ "message": "Todo deleted" }`.
  - Target todo item is removed from the DOM.
  - Database row is deleted.
- **Priority**: Critical
- **Test Type**: UI / Smoke
- **Automation Suitability**: Yes

---

## 10. Multi-Tenant User Data Isolation Module (`DATA-ISOLATION`)

### TC-ISO-001: Prevent Cross-User Todo Retrieval (Read Isolation)
- **Module**: Data Isolation
- **Test Scenario**: `SC-ISO-01`
- **Test Case Title**: Verify User A cannot retrieve or view User B's todos via API or UI.
- **Preconditions**: User A (`userA@example.com`) has Todo A. User B (`userB@example.com`) has Todo B.
- **Test Steps**:
  1. Authenticate as User A and call `GET /api/todos`.
  2. Inspect returned array.
- **Test Data**: User A and User B credentials.
- **Expected Result**:
  - User A's response contains only Todo A.
  - Todo B is completely absent from the response.
- **Priority**: Critical
- **Test Type**: API / Security
- **Automation Suitability**: Yes

---

### TC-ISO-002: Prevent Cross-User Todo Modification (Write Isolation)
- **Module**: Data Isolation
- **Test Scenario**: `SC-ISO-02`
- **Test Case Title**: Verify User A sending `PUT /api/todos/:id` for User B's todo ID receives 404 Not Found.
- **Preconditions**: User B owns Todo with `id = 42`. User A is authenticated.
- **Test Steps**:
  1. Using User A's session cookie, send `PUT /api/todos/42` with body `{"title": "Hacked Title"}`.
- **Test Data**: Foreign todo ID `42`.
- **Expected Result**:
  - Server returns HTTP 404 Not Found with `{ "errors": [{ "message": "Todo not found" }] }`.
  - User B's todo remains unchanged in the database.
- **Priority**: Critical
- **Test Type**: API / Security
- **Automation Suitability**: Yes

---

### TC-ISO-003: Prevent Cross-User Todo Toggle (Toggle Isolation)
- **Module**: Data Isolation
- **Test Scenario**: `SC-ISO-03`
- **Test Case Title**: Verify User A cannot toggle User B's todo via `PATCH /api/todos/:id/toggle`.
- **Preconditions**: User B owns Todo with `id = 42` (`is_completed = false`). User A is authenticated.
- **Test Steps**:
  1. Using User A's session cookie, send `PATCH /api/todos/42/toggle`.
- **Test Data**: Foreign todo ID `42`.
- **Expected Result**:
  - Server returns HTTP 404 Not Found with `{ "errors": [{ "message": "Todo not found" }] }`.
  - User B's todo retains `is_completed = false` in database.
- **Priority**: Critical
- **Test Type**: API / Security
- **Automation Suitability**: Yes

---

### TC-ISO-004: Prevent Cross-User Todo Deletion (Delete Isolation)
- **Module**: Data Isolation
- **Test Scenario**: `SC-ISO-04`
- **Test Case Title**: Verify User A cannot delete User B's todo via `DELETE /api/todos/:id`.
- **Preconditions**: User B owns Todo with `id = 42`. User A is authenticated.
- **Test Steps**:
  1. Using User A's session cookie, send `DELETE /api/todos/42`.
- **Test Data**: Foreign todo ID `42`.
- **Expected Result**:
  - Server returns HTTP 404 Not Found with `{ "errors": [{ "message": "Todo not found" }] }`.
  - User B's todo is not deleted and remains in database.
- **Priority**: Critical
- **Test Type**: API / Security
- **Automation Suitability**: Yes

---

## 11. API Contracts & Error Handling Module (`API-ERROR`)

### TC-ERR-001: Unauthorized Request Handling (401)
- **Module**: API Contracts
- **Test Scenario**: `SC-ERR-03`
- **Test Case Title**: Verify API routes under `/api/todos` reject requests without `token` cookie with 401.
- **Preconditions**: No auth cookie provided.
- **Test Steps**:
  1. Send `GET /api/todos` without `Cookie` header.
  2. Send `POST /api/todos` without `Cookie` header.
  3. Send `PUT /api/todos/1` without `Cookie` header.
  4. Send `PATCH /api/todos/1/toggle` without `Cookie` header.
  5. Send `DELETE /api/todos/1` without `Cookie` header.
- **Test Data**: Unauthenticated requests.
- **Expected Result**:
  - All 5 requests return HTTP 401 Unauthorized with `{ "errors": [{ "message": "Not authenticated" }] }`.
- **Priority**: Critical
- **Test Type**: API / Security
- **Automation Suitability**: Yes

---

### TC-ERR-002: Invalid Route Parameter Validation (400 on Non-Integer ID)
- **Module**: API Contracts
- **Test Scenario**: `SC-ERR-05`
- **Test Case Title**: Verify non-positive integer `:id` parameters return 400 Bad Request.
- **Preconditions**: Authenticated user session.
- **Test Steps**:
  1. Send `PUT /api/todos/abc` with valid body.
  2. Send `PATCH /api/todos/-1/toggle`.
  3. Send `DELETE /api/todos/0`.
- **Test Data**: IDs `abc`, `-1`, `0`.
- **Expected Result**:
  - Returns HTTP 400 Bad Request with `{ "errors": [{ "field": "id", "message": "Todo ID must be a positive integer" }] }`.
- **Priority**: High
- **Test Type**: API / Negative
- **Automation Suitability**: Yes

---

### TC-ERR-003: Central 404 Route Handler for Unknown Paths
- **Module**: API Contracts
- **Test Scenario**: `SC-ERR-04`
- **Test Case Title**: Verify central 404 handler returns structured JSON for non-existent routes.
- **Preconditions**: Server is running.
- **Test Steps**:
  1. Send `GET /api/nonexistent`.
  2. Send `POST /api/todos/invalid/subroute`.
- **Test Data**: Invalid endpoints above.
- **Expected Result**:
  - Returns HTTP 404 Not Found with JSON `{ "errors": [{ "message": "Route <METHOD> <PATH> not found" }] }`.
- **Priority**: Medium
- **Test Type**: API / Negative
- **Automation Suitability**: Yes

---

## 12. Database Constraints & Consistency Module (`DB-INTEGRITY`)

### TC-DBI-001: Enforce Foreign Key Cascade Deletion
- **Module**: Database Consistency
- **Test Scenario**: `SC-DBI-04`
- **Test Case Title**: Verify deleting a user record from `users` automatically purges all their todos.
- **Preconditions**: Database connected. User with `id = 10` has 3 todos in `todos` table.
- **Test Steps**:
  1. Execute SQL: `DELETE FROM users WHERE id = 10;`.
  2. Execute SQL: `SELECT COUNT(*) FROM todos WHERE user_id = 10;`.
- **Test Data**: `id = 10`.
- **Expected Result**:
  - Query 1 completes with `DELETE 1`.
  - Query 2 returns count `0`. Cascade delete works as specified.
- **Priority**: Critical
- **Test Type**: Database / Integrity
- **Automation Suitability**: Yes

---

### TC-DBI-002: Database Check Constraint on Empty Todo Title
- **Module**: Database Consistency
- **Test Scenario**: `SC-DBI-03`
- **Test Case Title**: Verify `todos` table CHECK constraint rejects empty title string at SQL level.
- **Preconditions**: Database connected. Valid user `id = 1` exists.
- **Test Steps**:
  1. Execute SQL: `INSERT INTO todos (user_id, title) VALUES (1, '   ');`.
- **Test Data**: `title`: `'   '`.
- **Expected Result**:
  - PostgreSQL throws `check constraint violation` (`todos_title_check`). Insert fails.
- **Priority**: High
- **Test Type**: Database / Constraint
- **Automation Suitability**: Yes
