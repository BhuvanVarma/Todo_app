import { test, expect } from '../../fixtures/index.js';

test.describe('@smoke UI Smoke Tests - Authentication View', () => {
  test('should load the login page with all expected accessible form elements', async ({ loginPage, page }) => {
    // 1. Navigate to the login page
    await loginPage.goto();

    // 2. Verify URL contains /login
    await expect(page).toHaveURL(/.*\/login/);

    // 3. Verify expected accessible elements are present and visible
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.subtitle).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
    await expect(loginPage.registerLink).toBeVisible();
  });
});
