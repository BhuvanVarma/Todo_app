import { test, expect } from '../../fixtures/index.js';

test.describe('UI - Navigation & Session Guards', () => {
  test('UI-NAV-001: Redirect unauthenticated user from /todos to /login', async ({ page }) => {
    await page.goto('/todos');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('UI-NAV-002: Redirect unknown routes through protected flow to /login', async ({ page }) => {
    await page.goto('/random-nonexistent-path');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('UI-NAV-003: Maintain active session after browser page refresh', async ({ authenticatedPage, todosPage }) => {
    const { page, user } = authenticatedPage;

    // Verify authenticated initially
    await expect(page).toHaveURL(/.*\/todos/);
    await expect(todosPage.navbar.userGreeting).toHaveText(`Hi, ${user.name}`);

    // Refresh page
    await page.reload();

    // Verify session maintained without kicking to /login
    await expect(page).toHaveURL(/.*\/todos/);
    await expect(todosPage.navbar.userGreeting).toHaveText(`Hi, ${user.name}`);
  });

  test('UI-NAV-004: Logout clears session and prevents access to /todos', async ({ authenticatedPage, loginPage, todosPage }) => {
    const { page } = authenticatedPage;

    // Click Logout
    await todosPage.navbar.logout();

    // Verify redirection to /login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(loginPage.heading).toBeVisible();

    // Attempt back navigation or explicit navigation to /todos
    await page.goto('/todos');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
