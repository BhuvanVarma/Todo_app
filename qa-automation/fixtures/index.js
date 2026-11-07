import { test as base } from '@playwright/test';
import { LoginPage, RegisterPage, TodosPage, Navbar } from '../pages/index.js';
import { ApiClient } from '../utils/apiClient.js';
import { generateTestUser } from '../utils/index.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';

/**
 * Custom Playwright test fixture extending base test runner.
 */
export const test = base.extend({
  // Pre-configured ApiClient for API operations
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request, API_BASE_URL);
    await use(client);
  },

  // Page Object fixtures
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  todosPage: async ({ page }, use) => {
    await use(new TodosPage(page));
  },

  navbar: async ({ page }, use) => {
    await use(new Navbar(page));
  },

  // Fixture providing a fresh registered user via API
  registeredUser: async ({ request }, use) => {
    const client = new ApiClient(request, API_BASE_URL);
    const userData = generateTestUser();
    const res = await client.register(userData);
    const body = await res.json();
    await use({
      credentials: userData,
      user: body.user,
      apiClient: client,
    });
  },

  // Fixture providing an already authenticated page session on /todos
  authenticatedPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    const todosPage = new TodosPage(page);
    const userData = generateTestUser();
    await registerPage.goto();
    await registerPage.register(userData);
    await page.waitForURL('**/todos');
    await todosPage.expectLoaded();
    // Wait for any initial fetch spinner to settle
    await page.locator('.state-msg .spinner').waitFor({ state: 'detached' }).catch(() => {});
    await use({ page, user: userData });
  },
});

export { expect } from '@playwright/test';
