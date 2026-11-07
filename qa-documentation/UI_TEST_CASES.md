# UI Test Cases Specification: PERN Todo Application

**Document Version**: 1.0.0
**Author**: Senior QA Engineer / Test Architect
**Layer**: User Interface (Browser Execution & Playwright Automation)
**Base URL**: `http://localhost:5173`

---

## 1. UI Suite Architecture & Selectors Map

| Component / Target | CSS / Role Selector | Attribute / Event | Verification Purpose |
|---|---|---|---|
| Register Name Input | `input#name` | `maxLength="50"`, `value` | Name entry & length cap |
| Register Email Input | `input#email` | `type="email"`, `value` | Email entry |
| Register Password Input | `input#password` | `type="password"`, `value` | Password entry |
| Register Confirm Input | `input#confirmPassword` | `type="password"`, `value` | Password confirmation |
| Register Submit Button | `button[type="submit"]` | Text: `Create account` | Submission trigger |
| Login Email Input | `input#email` | `type="email"`, `value` | Login email entry |
| Login Password Input | `input#password` | `type="password"`, `value` | Login password entry |
| Login Submit Button | `button[type="submit"]` | Text: `Log in` | Login trigger |
| Global Alert Banner | `div.alert.alert-error` | Text content | Server/API error display |
| Inline Field Error | `p.field-error` | Text content | Client validation feedback |
| Errored Input Border | `input.error`, `textarea.error` | Border color `var(--danger)` | Visual error highlight |
| Add Todo Title Input | `input[placeholder="What do you need to do?"]` | `maxLength="100"`, `value` | New todo title entry |
| Add Todo Description Toggle | `button.add-todo-toggle` | Text: `+ Add description` / `– Hide description` | Expands/collapses textarea |
| Add Todo Description Area | `textarea[placeholder="Optional description…"]` | `maxLength="500"`, `value` | New todo description entry |
| Add Todo Button | `button.btn-primary:has-text("Add")` | Click | Creates new todo |
| Todo Item Checkbox | `input[type="checkbox"].todo-checkbox` | `checked`, `aria-label="Toggle complete"` | Completion toggle |
| Todo Item Card | `.todo-item` | Class `.completed` | Card container & styling |
| Todo Title Display | `.todo-title` | Text, `text-decoration` | Displays title |
| Todo Description Display | `.todo-desc` | Text content | Displays optional description |
| Edit Trigger Button | `.todo-actions button:has-text("✏️")` | `aria-label="Edit"` | Activates inline edit form |
| Delete Trigger Button | `.todo-actions button:has-text("🗑️")` | `aria-label="Delete"` | Triggers browser `confirm()` |
| Edit Title Input | `input[id^="edit-title-"]` | `value`, `maxLength="100"` | Inline title modification |
| Edit Description Textarea | `textarea[id^="edit-desc-"]` | `value`, `maxLength="500"` | Inline desc modification |
| Edit Save Button | `.edit-form button[type="submit"]:has-text("Save")` | Click | Commits inline update |
| Edit Cancel Button | `.edit-form button:has-text("Cancel")` | Click | Discards inline update |
| List Loading State | `.state-msg:has-text("Loading todos…")` | `.spinner` visibility | Async loading indicator |
| List Empty State | `.state-msg:has-text("No todos yet")` | Text content | Zero-data empty state |
| Navbar User Greeting | `.navbar .nav-info span` | Text: `Hi, {name}` | Active session badge |
| Navbar Logout Button | `.navbar .nav-info button:has-text("Logout")` | Click | Ends active session |

---

## 2. Playwright UI Automation Suite

### UI-TC-001: Register -> Auto-Login -> Verify Dashboard
- **Suite**: Playwright UI Automation
- **Target URL**: `/register`
- **Steps**:
  1. `await page.goto('/register')`
  2. `await page.fill('input#name', 'Playwright User')`
  3. `await page.fill('input#email', `pw_${Date.now()}@test.com`)`
  4. `await page.fill('input#password', 'TestPassword123')`
  5. `await page.fill('input#confirmPassword', 'TestPassword123')`
  6. `await page.click('button[type="submit"]')`
  7. `await expect(page).toHaveURL(/.*\/todos/)`
  8. `await expect(page.locator('.navbar .nav-info span')).toHaveText('Hi, Playwright User')`
  9. `await expect(page.locator('.state-msg')).toHaveText('No todos yet — add one above! 👆')`
- **Expected Outcome**: Instant redirect to `/todos`, navbar greeting rendered, empty list displayed.

---

### UI-TC-002: Real-Time Field Error Clearance UX
- **Suite**: Playwright UI Automation
- **Target URL**: `/register`
- **Steps**:
  1. `await page.goto('/register')`
  2. `await page.click('button[type="submit"]')`
  3. `await expect(page.locator('p.field-error').first()).toBeVisible()`
  4. Type one character in `input#name`: `await page.type('input#name', 'A')`
  5. Inspect error under `input#name`.
- **Expected Outcome**: As soon as typing occurs, `errors.name` is cleared from state and the error message disappears immediately.

---

### UI-TC-003: Login Validation & Error Highlighting
- **Suite**: Playwright UI Automation
- **Target URL**: `/login`
- **Steps**:
  1. `await page.goto('/login')`
  2. Click `Log in` without entering credentials.
  3. `await expect(page.locator('input#email')).toHaveClass(/error/)`
  4. `await expect(page.locator('input#password')).toHaveClass(/error/)`
  5. Enter `unregistered@example.com` and `WrongPass123`.
  6. Click `Log in`.
  7. `await expect(page.locator('div.alert.alert-error')).toHaveText('Invalid email or password')`
- **Expected Outcome**: Validation errors highlight input borders; invalid credentials render global red banner.

---

### UI-TC-004: Create Todo with Description Toggle & Optimistic Rendering
- **Suite**: Playwright UI Automation
- **Target URL**: `/todos` (authenticated)
- **Steps**:
  1. Ensure user is logged in on `/todos`.
  2. `await page.fill('input[placeholder="What do you need to do?"]', 'UI Automated Task')`
  3. `await page.click('button.add-todo-toggle')`
  4. `await expect(page.locator('textarea[placeholder="Optional description…"]')).toBeVisible()`
  5. `await page.fill('textarea[placeholder="Optional description…"]', 'Detailed testing notes.')`
  6. `await page.click('button.btn-primary:has-text("Add")')`
  7. `await expect(page.locator('.todo-item').first().locator('.todo-title')).toHaveText('UI Automated Task')`
  8. `await expect(page.locator('.todo-item').first().locator('.todo-desc')).toHaveText('Detailed testing notes.')`
  9. `await expect(page.locator('textarea[placeholder="Optional description…"]')).not.toBeVisible()`
- **Expected Outcome**: Form resets, textarea collapses, item immediately prepends to list.

---

### UI-TC-005: Todo Completion Toggle Visual Strike-through
- **Suite**: Playwright UI Automation
- **Target URL**: `/todos` (authenticated)
- **Steps**:
  1. Locate the first `.todo-item`.
  2. `const checkbox = page.locator('.todo-item').first().locator('input.todo-checkbox');`
  3. `await checkbox.check();`
  4. `await expect(page.locator('.todo-item').first()).toHaveClass(/completed/);`
  5. `const textDecoration = await page.locator('.todo-item .todo-title').first().evaluate(el => window.getComputedStyle(el).textDecorationLine);`
  6. Verify `textDecoration === 'line-through'`.
  7. `await checkbox.uncheck();`
  8. `await expect(page.locator('.todo-item').first()).not.toHaveClass(/completed/);`
- **Expected Outcome**: `.completed` CSS class correctly controls visual opacity and strike-through.

---

### UI-TC-006: Inline Edit and Save Workflow
- **Suite**: Playwright UI Automation
- **Target URL**: `/todos` (authenticated)
- **Steps**:
  1. On first todo item, click edit button `await page.locator('.todo-actions button:has-text("✏️")').first().click()`.
  2. `await expect(page.locator('.edit-form')).toBeVisible()`.
  3. `await page.fill('.edit-form input[id^="edit-title-"]', 'Edited Title via UI')`.
  4. `await page.fill('.edit-form textarea[id^="edit-desc-"]', 'Edited Description via UI')`.
  5. `await page.click('.edit-form button:has-text("Save")')`.
  6. `await expect(page.locator('.edit-form')).not.toBeVisible()`.
  7. `await expect(page.locator('.todo-item .todo-title').first()).toHaveText('Edited Title via UI')`.
- **Expected Outcome**: Form closes; updated title and description display in item view.

---

### UI-TC-007: Handle Browser Native Confirmation Dialog on Delete
- **Suite**: Playwright UI Automation
- **Target URL**: `/todos` (authenticated)
- **Steps**:
  1. Register dialog handler to dismiss first:
     ```javascript
     page.once('dialog', async dialog => {
       expect(dialog.message()).toBe('Delete this todo?');
       await dialog.dismiss();
     });
     ```
  2. Click delete button `await page.locator('.todo-actions button:has-text("🗑️")').first().click()`.
  3. Confirm item is still in DOM.
  4. Register dialog handler to accept:
     ```javascript
     page.once('dialog', async dialog => {
       await dialog.accept();
     });
     ```
  5. Click delete button again.
  6. `await expect(page.locator('.todo-item')).toHaveCount(0)`.
  7. `await expect(page.locator('.state-msg')).toHaveText('No todos yet — add one above! 👆')`.
- **Expected Outcome**: Dialog message is verified; cancellation preserves item; acceptance removes item and transitions list to empty state.

---

## 3. Manual Exploratory UI Checklist

| Check ID | Area / Feature | Action / Stress Scenario | Expected Visual Outcome |
|---|---|---|---|
| `MAN-UI-01` | Responsiveness | Resize viewport to 375px (iPhone SE). Inspect forms and todo cards. | No horizontal scrolling. Cards adapt smoothly to mobile width. |
| `MAN-UI-02` | Ultra-Long Strings | Submit a 100-character single word title without spaces (`WWWWW...`). | CSS `word-break: break-word` prevents text overflowing card container. |
| `MAN-UI-03` | Button In-Flight UX | Click `Create account` or `Save` on simulated 3G network throttle. | Button is disabled; spinner rotates; user cannot trigger duplicate clicks. |
| `MAN-UI-04` | Tab Navigation | Use `Tab` and `Shift+Tab` across inputs in `/register` and `/login`. | Focus ring clearly indicates active field; form submits on `Enter`. |
| `MAN-UI-05` | Action Error Dismissal | Trigger network error during toggle. Click `×` button on error alert. | Red error alert vanishes from DOM without requiring page reload. |
