import { test, expect } from '../../fixtures/index.js';

test.describe('UI - Multiple Todos Handling', () => {
  test('UI-TODO-010: Display multiple todos in newest-first order', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addTodo('First Created Item');
    await todosPage.addTodo('Second Created Item');
    await todosPage.addTodo('Third Created Item');

    await expect(todosPage.todoItems).toHaveCount(3);

    // Verify LIFO order: Third is 0, Second is 1, First is 2
    await expect(todosPage.getTodoItem(0).locator('.todo-title')).toHaveText('Third Created Item');
    await expect(todosPage.getTodoItem(1).locator('.todo-title')).toHaveText('Second Created Item');
    await expect(todosPage.getTodoItem(2).locator('.todo-title')).toHaveText('First Created Item');
  });

  test('UI-TODO-011: Maintain independent completion state across multiple items', async ({ authenticatedPage, todosPage }) => {
    await todosPage.addTodo('Item Alpha');
    await todosPage.addTodo('Item Beta');
    await todosPage.addTodo('Item Gamma');

    // Toggle only the middle item (Item Beta, index 1)
    await todosPage.toggleTodo(1);

    const itemGamma = todosPage.getTodoItem(0);
    const itemBeta = todosPage.getTodoItem(1);
    const itemAlpha = todosPage.getTodoItem(2);

    await expect(itemGamma).not.toHaveClass(/completed/);
    await expect(itemBeta).toHaveClass(/completed/);
    await expect(itemAlpha).not.toHaveClass(/completed/);
  });
});
