import { test, expect } from '../../fixtures/index.js';
import { testTodos } from '../../test-data/index.js';

test.describe('API - Todos CRUD Lifecycle (/api/todos)', () => {
  test('API-TODO-001: Create todo with title and description (201 Created)', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.createTodo(testTodos.standard);
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.todo).toBeDefined();
    expect(body.todo.id).toBeGreaterThan(0);
    expect(body.todo.title).toBe(testTodos.standard.title);
    expect(body.todo.description).toBe(testTodos.standard.description);
    expect(body.todo.is_completed).toBe(false);
    expect(body.todo.created_at).toBeDefined();
  });

  test('API-TODO-002: Create todo with title only (201 Created)', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.createTodo(testTodos.titleOnly);
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.todo.title).toBe(testTodos.titleOnly.title);
    expect(body.todo.description).toBeNull();
    expect(body.todo.is_completed).toBe(false);
  });

  test('API-TODO-003: Create todo with maximum boundary lengths (100 char title, 500 char desc)', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.createTodo(testTodos.boundaryMax);
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.todo.title).toBe(testTodos.boundaryMax.title);
    expect(body.todo.description).toBe(testTodos.boundaryMax.description);
  });

  test('API-TODO-004: List user todos ordered newest first (200 OK)', async ({ registeredUser }) => {
    // 1. Create two todos
    const res1 = await registeredUser.apiClient.createTodo({ title: 'First Todo' });
    const todo1 = (await res1.json()).todo;

    const res2 = await registeredUser.apiClient.createTodo({ title: 'Second Todo' });
    const todo2 = (await res2.json()).todo;

    // 2. Fetch all todos
    const listRes = await registeredUser.apiClient.getTodos();
    expect(listRes.status()).toBe(200);

    const body = await listRes.json();
    expect(Array.isArray(body.todos)).toBe(true);
    expect(body.todos.length).toBeGreaterThanOrEqual(2);

    // Verify ordering: newest created first
    const titles = body.todos.map((t) => t.id);
    const index1 = titles.indexOf(todo1.id);
    const index2 = titles.indexOf(todo2.id);
    expect(index2).toBeLessThan(index1);
  });

  test('API-TODO-005: Update todo title and description (200 OK)', async ({ registeredUser }) => {
    // 1. Create todo
    const createRes = await registeredUser.apiClient.createTodo(testTodos.standard);
    const createdTodo = (await createRes.json()).todo;

    // 2. Update todo
    const updateRes = await registeredUser.apiClient.updateTodo(createdTodo.id, testTodos.updated);
    expect(updateRes.status()).toBe(200);

    const body = await updateRes.json();
    expect(body.todo.id).toBe(createdTodo.id);
    expect(body.todo.title).toBe(testTodos.updated.title);
    expect(body.todo.description).toBe(testTodos.updated.description);
  });

  test('API-TODO-006: Toggle todo completion status (200 OK)', async ({ registeredUser }) => {
    // 1. Create todo
    const createRes = await registeredUser.apiClient.createTodo(testTodos.titleOnly);
    const createdTodo = (await createRes.json()).todo;
    expect(createdTodo.is_completed).toBe(false);

    // 2. Toggle to completed (true)
    const toggle1 = await registeredUser.apiClient.toggleTodo(createdTodo.id);
    expect(toggle1.status()).toBe(200);
    const body1 = await toggle1.json();
    expect(body1.todo.is_completed).toBe(true);

    // 3. Toggle back to active (false)
    const toggle2 = await registeredUser.apiClient.toggleTodo(createdTodo.id);
    expect(toggle2.status()).toBe(200);
    const body2 = await toggle2.json();
    expect(body2.todo.is_completed).toBe(false);
  });

  test('API-TODO-007: Delete todo and verify removal (200 OK)', async ({ registeredUser }) => {
    // 1. Create todo
    const createRes = await registeredUser.apiClient.createTodo(testTodos.titleOnly);
    const createdTodo = (await createRes.json()).todo;

    // 2. Delete todo
    const deleteRes = await registeredUser.apiClient.deleteTodo(createdTodo.id);
    expect(deleteRes.status()).toBe(200);
    const deleteBody = await deleteRes.json();
    expect(deleteBody.message).toBe('Todo deleted');

    // 3. Confirm deletion in todos list
    const listRes = await registeredUser.apiClient.getTodos();
    const listBody = await listRes.json();
    const exists = listBody.todos.some((t) => t.id === createdTodo.id);
    expect(exists).toBe(false);

    // 4. Deleting again returns 404
    const secondDelete = await registeredUser.apiClient.deleteTodo(createdTodo.id);
    expect(secondDelete.status()).toBe(404);
  });
});
