/**
 * Page Object representing the Login Page (/login)
 */
export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Welcome back' });
    this.subtitle = page.getByText('Log in to your account');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.registerLink = page.getByRole('link', { name: 'Register' });
    this.serverErrorAlert = page.locator('.alert.alert-error');
    this.emailFieldError = page.locator('.form-group:has(#email) .field-error');
    this.passwordFieldError = page.locator('.form-group:has(#password) .field-error');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    if (email !== undefined) {
      await this.emailInput.fill(email);
    }
    if (password !== undefined) {
      await this.passwordInput.fill(password);
    }
    await this.loginButton.click();
  }

  async expectLoaded() {
    await this.heading.waitFor({ state: 'visible' });
    await this.loginButton.waitFor({ state: 'visible' });
  }
}
