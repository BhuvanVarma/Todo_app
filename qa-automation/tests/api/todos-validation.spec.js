import { test, expect } from '../../fixtures/index.js';
import { testTodos } from '../../test-data/index.js';

test.describe('API - Todos Field Validation & Edge Cases (/api/todos)', () => {
  test('API-VAL-001: Reject todo creation without title (400 Bad Request)', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.createTodo({});
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'title', message: 'Title is required' }),
      ])
    );
  });

  test('API-VAL-002: Reject todo creation with empty/whitespace title (400 Bad Request)', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.createTodo({ title: '    ' });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'title', message: 'Title is required' }),
      ])
    );
  });

  test('API-VAL-003: Reject todo creation with title exceeding 100 chars (400 Bad Request)', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.createTodo(testTodos.boundaryOverTitle);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'title', message: 'Title must be 1–100 characters' }),
      ])
    );
  });

  test('API-VAL-004: Reject todo creation with description exceeding 500 chars (400 Bad Request)', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.createTodo(testTodos.boundaryOverDescription);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'description', message: 'Description must be at most 500 characters' }),
      ])
    );
  });

  test('API-VAL-005: Reject todo update with invalid non-numeric ID (400 Bad Request)', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.updateTodo('notanid', { title: 'Valid Title' });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'id', message: 'Todo ID must be a positive integer' }),
      ])
    );
  });

  test('API-VAL-006: Reject todo toggle with negative or zero ID (400 Bad Request)', async ({ registeredUser }) => {
    for (const invalidId of [0, -1, -99]) {
      const res = await registeredUser.apiClient.toggleTodo(invalidId);
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'id', message: 'Todo ID must be a positive integer' }),
        ])
      );
    }
  });

  test('API-VAL-007: Return 404 Not Found when updating non-existent todo ID', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.updateTodo(99999999, { title: 'Updated Title' });
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Todo not found' }),
      ])
    );
  });

  test('API-VAL-008: Return 404 Not Found when deleting non-existent todo ID', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.deleteTodo(99999999);
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Todo not found' }),
      ])
    );
  });
});
