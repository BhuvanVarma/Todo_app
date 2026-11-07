import { test, expect } from '../../fixtures/index.js';
import { generateTestUser } from '../../utils/index.js';
import { ApiClient } from '../../utils/apiClient.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';

test.describe('E2E Integration - Multi-Tier Fullstack Scenarios', () => {
  test('INT-001: Register via UI, create Todo in UI, and verify persistence via backend API', async ({ registerPage, todosPage, playwright, page }) => {
    // 1. Register through UI
    const userData = generateTestUser({ name: 'Integration User One' });
    await registerPage.goto();
    await registerPage.register(userData);
    await expect(page).toHaveURL(/.*\/todos/);

    // 2. Create Todo through UI
    const todoTitle = `UI to API Todo ${Date.now()}`;
    const todoDesc = 'Created from browser form';
    await todosPage.addTodo(todoTitle, todoDesc);
    await expect(todosPage.todoItems).toHaveCount(1);

    // 3. Connect to API as this user
    const apiContext = await playwright.request.newContext();
    const apiClient = new ApiClient(apiContext, API_BASE_URL);
    await apiClient.login({ email: userData.email, password: userData.password });

    // 4. Verify Todo through API
    const res = await apiClient.getTodos();
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.todos).toHaveLength(1);
    expect(body.todos[0].title).toBe(todoTitle);
    expect(body.todos[0].description).toBe(todoDesc);
    expect(body.todos[0].is_completed).toBe(false);

    await apiContext.dispose();
  });

  test('INT-002: Create Todo through API and verify immediate rendering in UI', async ({ registerPage, todosPage, playwright, page }) => {
    // 1. Register through UI to establish browser session
    const userData = generateTestUser({ name: 'API to UI User' });
    await registerPage.goto();
    await registerPage.register(userData);
    await expect(page).toHaveURL(/.*\/todos/);

    // 2. Inject Todo directly through backend API
    const apiContext = await playwright.request.newContext();
    const apiClient = new ApiClient(apiContext, API_BASE_URL);
    await apiClient.login({ email: userData.email, password: userData.password });

    const apiTitle = `API Injected Todo ${Date.now()}`;
    const apiDesc = 'Inserted via direct API POST call';
    const createRes = await apiClient.createTodo({ title: apiTitle, description: apiDesc });
    expect(createRes.status()).toBe(201);

    // 3. Reload browser page
    await page.reload();

    // 4. Verify Todo renders in the browser
    await expect(todosPage.todoItems).toHaveCount(1);
    const item = todosPage.getTodoItem(0);
    await expect(item.locator('.todo-title')).toHaveText(apiTitle);
    await expect(item.locator('.todo-desc')).toHaveText(apiDesc);

    await apiContext.dispose();
  });

  test('INT-003: Update and complete Todo in UI, verify backend data integrity', async ({ registerPage, todosPage, playwright, page }) => {
    // 1. Setup user and todo via UI
    const userData = generateTestUser({ name: 'Lifecycle Tester' });
    await registerPage.goto();
    await registerPage.register(userData);
    await expect(page).toHaveURL(/.*\/todos/);

    await todosPage.addTodo('Initial Lifecycle Title', 'Initial Description');
    await expect(todosPage.todoItems).toHaveCount(1);

    // 2. Edit Todo in UI
    await todosPage.editTodo(0, 'Modified Lifecycle Title', 'Modified Description');

    // 3. Toggle Complete in UI
    await todosPage.toggleTodo(0);

    // 4. Verify state via API
    const apiContext = await playwright.request.newContext();
    const apiClient = new ApiClient(apiContext, API_BASE_URL);
    await apiClient.login({ email: userData.email, password: userData.password });

    const res = await apiClient.getTodos();
    const body = await res.json();
    expect(body.todos[0].title).toBe('Modified Lifecycle Title');
    expect(body.todos[0].description).toBe('Modified Description');
    expect(body.todos[0].is_completed).toBe(true);

    await apiContext.dispose();
  });

  test('INT-004: Multi-user isolation across UI and API', async ({ registerPage, todosPage, browser, playwright, page }) => {
    // 1. User A registers and creates a todo
    const userA = generateTestUser({ name: 'User Alpha' });
    await registerPage.goto();
    await registerPage.register(userA);
    await todosPage.addTodo('User Alpha Secret Todo');
    await expect(todosPage.todoItems).toHaveCount(1);

    // Retrieve User A's todo ID via API
    const apiContextA = await playwright.request.newContext();
    const clientA = new ApiClient(apiContextA, API_BASE_URL);
    await clientA.login({ email: userA.email, password: userA.password });
    const listA = await (await clientA.getTodos()).json();
    const userATodoId = listA.todos[0].id;

    // 2. Open an isolated browser context for User B
    const userBContext = await browser.newContext();
    const userBPage = await userBContext.newPage();
    const registerPageB = new (registerPage.constructor)(userBPage);
    const todosPageB = new (todosPage.constructor)(userBPage);

    const userB = generateTestUser({ name: 'User Beta' });
    await registerPageB.goto();
    await registerPageB.register(userB);

    // 3. Verify User B sees empty state in UI (cannot see User A's item)
    await expect(todosPageB.emptyStateMessage).toBeVisible();
    await expect(todosPageB.todoItems).toHaveCount(0);

    // 4. Verify User B cannot access or modify User A's todo via API
    const apiContextB = await playwright.request.newContext();
    const clientB = new ApiClient(apiContextB, API_BASE_URL);
    await clientB.login({ email: userB.email, password: userB.password });

    const hackUpdate = await clientB.updateTodo(userATodoId, { title: 'Hacked Title' });
    expect(hackUpdate.status()).toBe(404);

    const hackDelete = await clientB.deleteTodo(userATodoId);
    expect(hackDelete.status()).toBe(404);

    // Clean up
    await apiContextA.dispose();
    await apiContextB.dispose();
    await userBContext.close();
  });

  test('INT-005: Delete Todo in UI and verify database cleanup via API', async ({ registerPage, todosPage, playwright, page }) => {
    // 1. Register and add todo
    const userData = generateTestUser({ name: 'Delete Tester' });
    await registerPage.goto();
    await registerPage.register(userData);
    await todosPage.addTodo('Item to be deleted permanently');
    await expect(todosPage.todoItems).toHaveCount(1);

    // 2. Delete todo in UI
    await todosPage.deleteTodo(0, true);
    await expect(todosPage.emptyStateMessage).toBeVisible();

    // 3. Confirm deletion in database via API
    const apiContext = await playwright.request.newContext();
    const apiClient = new ApiClient(apiContext, API_BASE_URL);
    await apiClient.login({ email: userData.email, password: userData.password });

    const res = await apiClient.getTodos();
    const body = await res.json();
    expect(body.todos).toHaveLength(0);

    await apiContext.dispose();
  });
});
