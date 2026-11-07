import { test, expect } from '../../fixtures/index.js';
import { generateTestUser } from '../../utils/index.js';

test.describe('UI - Registration Flow (/register)', () => {
  test('UI-REG-001: Register view renders with accessible form elements', async ({ registerPage, page }) => {
    await registerPage.goto();
    await expect(page).toHaveURL(/.*\/register/);

    await expect(registerPage.heading).toBeVisible();
    await expect(registerPage.subtitle).toBeVisible();
    await expect(registerPage.nameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.registerButton).toBeVisible();
    await expect(registerPage.loginLink).toBeVisible();
  });

  test('UI-REG-002: Display inline validation errors for empty submission', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.registerButton.click();

    await expect(registerPage.nameFieldError).toHaveText('Name is required');
    await expect(registerPage.emailFieldError).toHaveText('Email is required');
    await expect(registerPage.passwordFieldError).toHaveText('Password is required');
    await expect(registerPage.confirmPasswordFieldError).toHaveText('Please confirm your password');
  });

  test('UI-REG-003: Display client error when passwords do not match', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.register({
      name: 'Test Mismatch',
      email: 'mismatch@example.com',
      password: 'Password123!',
      confirmPassword: 'MismatchPassword123!',
    });

    await expect(registerPage.confirmPasswordFieldError).toHaveText('Passwords do not match');
  });

  test('UI-REG-004: Complete user registration and verify redirect to /todos', async ({ registerPage, todosPage, page }) => {
    const userData = generateTestUser({ name: 'Happy Path Tester' });

    await registerPage.goto();
    await registerPage.register(userData);

    // Assert navigation to dashboard
    await expect(page).toHaveURL(/.*\/todos/);
    await expect(todosPage.heading).toBeVisible();
    await expect(todosPage.navbar.userGreeting).toHaveText(`Hi, ${userData.name}`);
  });

  test('UI-REG-005: Display field error for duplicate email', async ({ registerPage, apiClient }) => {
    // 1. Pre-register user via API
    const existingUser = generateTestUser();
    await apiClient.register(existingUser);

    // 2. Attempt registering same email via UI
    await registerPage.goto();
    await registerPage.register({
      name: 'Duplicate Attempt',
      email: existingUser.email,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    await expect(registerPage.emailFieldError).toBeVisible();
    await expect(registerPage.emailFieldError).toHaveText('Email already in use');
  });
});
