import { expect } from '@playwright/test';
import { Navbar } from './Navbar.js';

/**
 * Page Object representing the Todos Dashboard Page (/todos)
 */
export class TodosPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.navbar = new Navbar(page);
    this.heading = page.getByRole('heading', { name: 'My Todos' });
    this.addTodoHeading = page.getByRole('heading', { name: 'Add a todo' });
    this.titleInput = page.getByPlaceholder('What do you need to do?');
    this.addButton = page.getByRole('button', { name: 'Add', exact: true });
    this.descriptionToggle = page.locator('button.add-todo-toggle');
    this.descriptionInput = page.getByPlaceholder('Optional description…');
    this.titleFieldError = page.locator('.add-todo-row .field-error');
    this.descriptionFieldError = page.locator('.form-group:has(textarea) .field-error');
    this.serverErrorAlert = page.locator('.alert.alert-error');
    this.emptyStateMessage = page.getByText('No todos yet — add one above! 👆');
    this.todoItems = page.locator('.todo-item');
  }

  async goto() {
    await this.page.goto('/todos');
  }

  async expectLoaded() {
    await this.heading.waitFor({ state: 'visible' });
    await this.titleInput.waitFor({ state: 'visible' });
  }

  async addTodo(title, description = null) {
    await this.expectLoaded();
    const initialCount = await this.todoItems.count();

    await this.titleInput.fill(title);
    if (description !== null) {
      const isVisible = await this.descriptionInput.isVisible();
      if (!isVisible) {
        await this.descriptionToggle.click();
        await this.descriptionInput.waitFor({ state: 'visible' });
      }
      await this.descriptionInput.fill(description);
    }
    await this.addButton.click();

    // 1. Synchronize on newly created Todo item mounting into the DOM
    await expect(this.todoItems).toHaveCount(initialCount + 1);

    // 2. Verify newest item is prepended at index 0
    await expect(this.getTodoItem(0).locator('.todo-title')).toHaveText(title);

    // 3. Confirm React finished resetting form state before next sequential action
    await expect(this.titleInput).toHaveValue('');
    await expect(this.addButton).toBeEnabled();
  }

  getTodoItem(titleOrIndex) {
    if (typeof titleOrIndex === 'number') {
      return this.todoItems.nth(titleOrIndex);
    }
    return this.todoItems.filter({ hasText: titleOrIndex }).first();
  }

  async toggleTodo(titleOrIndex) {
    const item = this.getTodoItem(titleOrIndex);
    const checkbox = item.getByRole('checkbox', { name: 'Toggle complete' });
    await checkbox.click();
  }

  async editTodo(titleOrIndex, newTitle, newDescription = null) {
    const item = this.getTodoItem(titleOrIndex);
    await item.getByRole('button', { name: 'Edit', exact: true }).click();
    const editTitleInput = item.getByLabel('Title', { exact: true });
    await editTitleInput.fill(newTitle);
    if (newDescription !== null) {
      const editDescInput = item.getByLabel('Description (optional)', { exact: true });
      await editDescInput.fill(newDescription);
    }
    await item.getByRole('button', { name: 'Save', exact: true }).click();
  }

  async cancelEditTodo(titleOrIndex) {
    const item = this.getTodoItem(titleOrIndex);
    await item.getByRole('button', { name: 'Edit', exact: true }).click();
    await item.getByRole('button', { name: 'Cancel', exact: true }).click();
  }

  async deleteTodo(titleOrIndex, confirm = true) {
    const item = this.getTodoItem(titleOrIndex);
    this.page.once('dialog', async (dialog) => {
      if (confirm) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
    await item.getByRole('button', { name: 'Delete', exact: true }).click();
  }
}
