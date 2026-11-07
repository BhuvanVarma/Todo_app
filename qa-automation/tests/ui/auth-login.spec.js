import { test, expect } from '../../fixtures/index.js';
import { generateTestUser } from '../../utils/index.js';

test.describe('UI - Login Flow (/login)', () => {
  test('UI-LOG-001: Display inline validation errors for empty submission', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginButton.click();

    await expect(loginPage.emailFieldError).toHaveText('Email is required');
    await expect(loginPage.passwordFieldError).toHaveText('Password is required');
  });

  test('UI-LOG-002: Display alert banner for invalid login credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('nonexistent_user@example.com', 'WrongPassword123!');

    await expect(loginPage.serverErrorAlert).toBeVisible();
    await expect(loginPage.serverErrorAlert).toHaveText('Invalid email or password');
  });

  test('UI-LOG-003: Login successfully with valid credentials and redirect to /todos', async ({ loginPage, todosPage, apiClient, page }) => {
    // 1. Pre-register user via API
    const userData = generateTestUser({ name: 'Logged In User' });
    await apiClient.register(userData);

    // 2. Perform UI login
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);

    // 3. Verify navigation and greeting
    await expect(page).toHaveURL(/.*\/todos/);
    await expect(todosPage.heading).toBeVisible();
    await expect(todosPage.navbar.userGreeting).toHaveText(`Hi, ${userData.name}`);
  });

  test('UI-LOG-004: Navigate to /register when clicking Register link', async ({ loginPage, registerPage, page }) => {
    await loginPage.goto();
    await loginPage.registerLink.click();

    await expect(page).toHaveURL(/.*\/register/);
    await expect(registerPage.heading).toBeVisible();
  });
});
