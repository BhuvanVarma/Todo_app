/**
 * Page Object representing the Register Page (/register)
 */
export class RegisterPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Create account' });
    this.subtitle = page.getByText('Join to manage your todos');
    this.nameInput = page.getByLabel('Name', { exact: true });
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirm Password', { exact: true });
    this.registerButton = page.getByRole('button', { name: 'Create account' });
    this.loginLink = page.getByRole('link', { name: 'Log in' });
    this.serverErrorAlert = page.locator('.alert.alert-error');
    this.nameFieldError = page.locator('.form-group:has(#name) .field-error');
    this.emailFieldError = page.locator('.form-group:has(#email) .field-error');
    this.passwordFieldError = page.locator('.form-group:has(#password) .field-error');
    this.confirmPasswordFieldError = page.locator('.form-group:has(#confirmPassword) .field-error');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register({ name, email, password, confirmPassword }) {
    if (name !== undefined) {
      await this.nameInput.fill(name);
    }
    if (email !== undefined) {
      await this.emailInput.fill(email);
    }
    if (password !== undefined) {
      await this.passwordInput.fill(password);
    }
    if (confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(confirmPassword);
    }
    await this.registerButton.click();
  }

  async expectLoaded() {
    await this.heading.waitFor({ state: 'visible' });
    await this.registerButton.waitFor({ state: 'visible' });
  }
}
