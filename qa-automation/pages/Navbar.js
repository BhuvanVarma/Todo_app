/**
 * Page Object component representing the Global Navigation Bar
 */
export class Navbar {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.brandLink = page.getByRole('link', { name: '✅ Todo App' });
    this.userGreeting = page.locator('.nav-info span');
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }

  async logout() {
    await this.logoutButton.click();
  }
}
