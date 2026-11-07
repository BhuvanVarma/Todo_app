import { test, expect } from '../../fixtures/index.js';
import { testTodos } from '../../test-data/index.js';

test.describe('UI - Todos CRUD Workflow (/todos)', () => {
  test('UI-TODO-001: Display empty state message when user has no todos', async ({ authenticatedPage, todosPage }) => {
    await expect(todosPage.emptyStateMessage).toBeVisible();
    await expect(todosPage.todoItems).toHaveCount(0);
  });

  test('UI-TODO-002: Display inline validation error when adding empty title', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addButton.click();
    await expect(todosPage.titleFieldError).toHaveText('Title is required');
  });

  test('UI-TODO-003: Create a todo with title only', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addTodo(testTodos.titleOnly.title);

    await expect(todosPage.emptyStateMessage).not.toBeVisible();
    await expect(todosPage.todoItems).toHaveCount(1);

    const firstItem = todosPage.getTodoItem(0);
    await expect(firstItem.locator('.todo-title')).toHaveText(testTodos.titleOnly.title);
  });

  test('UI-TODO-004: Create a todo with title and description', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addTodo(testTodos.standard.title, testTodos.standard.description);

    await expect(todosPage.todoItems).toHaveCount(1);
    const item = todosPage.getTodoItem(0);
    await expect(item.locator('.todo-title')).toHaveText(testTodos.standard.title);
    await expect(item.locator('.todo-desc')).toHaveText(testTodos.standard.description);
  });

  test('UI-TODO-005: Toggle todo completion state', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addTodo('Toggle Test Todo');
    const item = todosPage.getTodoItem(0);
    const checkbox = item.getByRole('checkbox', { name: 'Toggle complete' });

    // Initially active (unchecked)
    await expect(checkbox).not.toBeChecked();
    await expect(item).not.toHaveClass(/completed/);

    // Toggle complete
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await expect(item).toHaveClass(/completed/);

    // Toggle back to active
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
    await expect(item).not.toHaveClass(/completed/);
  });

  test('UI-TODO-006: Edit todo title and description', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addTodo('Original Title', 'Original Description');

    await todosPage.editTodo(0, 'Updated Title Value', 'Updated Description Value');

    const item = todosPage.getTodoItem(0);
    await expect(item.locator('.todo-title')).toHaveText('Updated Title Value');
    await expect(item.locator('.todo-desc')).toHaveText('Updated Description Value');
  });

  test('UI-TODO-007: Cancel edit restores original todo values', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addTodo('Do Not Change Title');

    await todosPage.cancelEditTodo(0);

    const item = todosPage.getTodoItem(0);
    await expect(item.locator('.todo-title')).toHaveText('Do Not Change Title');
  });

  test('UI-TODO-008: Delete todo with confirmation removes item', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addTodo('Item to be deleted');
    await expect(todosPage.todoItems).toHaveCount(1);

    await todosPage.deleteTodo(0, true);

    await expect(todosPage.todoItems).toHaveCount(0);
    await expect(todosPage.emptyStateMessage).toBeVisible();
  });

  test('UI-TODO-009: Dismissing delete confirmation keeps item in list', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addTodo('Item to keep');
    await expect(todosPage.todoItems).toHaveCount(1);

    await todosPage.deleteTodo(0, false);

    await expect(todosPage.todoItems).toHaveCount(1);
    await expect(todosPage.getTodoItem(0).locator('.todo-title')).toHaveText('Item to keep');
  });
});
