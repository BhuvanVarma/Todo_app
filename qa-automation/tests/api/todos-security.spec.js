import { test, expect } from '../../fixtures/index.js';
import { generateTestUser } from '../../utils/index.js';
import { ApiClient } from '../../utils/apiClient.js';

test.describe('API - Security & Multi-User Data Isolation (/api/todos)', () => {
  test('API-SEC-001: Reject unauthenticated access to all todo endpoints (401 Unauthorized)', async ({ apiClient }) => {
    // 1. GET /api/todos
    const getRes = await apiClient.getTodos();
    expect(getRes.status()).toBe(401);

    // 2. POST /api/todos
    const postRes = await apiClient.createTodo({ title: 'Unauthorized Todo' });
    expect(postRes.status()).toBe(401);

    // 3. PUT /api/todos/1
    const putRes = await apiClient.updateTodo(1, { title: 'Unauthorized Update' });
    expect(putRes.status()).toBe(401);

    // 4. PATCH /api/todos/1/toggle
    const patchRes = await apiClient.toggleTodo(1);
    expect(patchRes.status()).toBe(401);

    // 5. DELETE /api/todos/1
    const delRes = await apiClient.deleteTodo(1);
    expect(delRes.status()).toBe(401);
  });

  test('API-SEC-002: Enforce strict multi-user data isolation across users', async ({ playwright, registeredUser }) => {
    // 1. User A creates a todo
    const userATodoRes = await registeredUser.apiClient.createTodo({
      title: 'Confidential User A Todo',
      description: 'Private notes for user A only',
    });
    expect(userATodoRes.status()).toBe(201);
    const userATodo = (await userATodoRes.json()).todo;

    // 2. Create User B in a completely separate request context (different cookie jar)
    const userBContext = await playwright.request.newContext();
    const userBClient = new ApiClient(userBContext, process.env.API_BASE_URL || 'http://localhost:5001');
    const userBData = generateTestUser({ name: 'User B Isolation' });
    const userBRegRes = await userBClient.register(userBData);
    expect(userBRegRes.status()).toBe(201);

    // 3. User B lists todos -> User A's todo must NOT appear
    const userBListRes = await userBClient.getTodos();
    const userBList = (await userBListRes.json()).todos;
    expect(userBList.some((t) => t.id === userATodo.id)).toBe(false);

    // 4. User B attempts to UPDATE User A's todo -> 404 Not Found
    const attackUpdateRes = await userBClient.updateTodo(userATodo.id, {
      title: 'Hacked by User B',
    });
    expect(attackUpdateRes.status()).toBe(404);

    // 5. User B attempts to TOGGLE User A's todo -> 404 Not Found
    const attackToggleRes = await userBClient.toggleTodo(userATodo.id);
    expect(attackToggleRes.status()).toBe(404);

    // 6. User B attempts to DELETE User A's todo -> 404 Not Found
    const attackDeleteRes = await userBClient.deleteTodo(userATodo.id);
    expect(attackDeleteRes.status()).toBe(404);

    // 7. Verify User A's todo is intact and unmodified
    const userAListRes = await registeredUser.apiClient.getTodos();
    const userAList = (await userAListRes.json()).todos;
    const originalTodo = userAList.find((t) => t.id === userATodo.id);
    expect(originalTodo).toBeDefined();
    expect(originalTodo.title).toBe('Confidential User A Todo');
    expect(originalTodo.is_completed).toBe(false);

    await userBContext.dispose();
  });
});
