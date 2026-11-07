/**
 * Reusable API Client wrapping Playwright's APIRequestContext for PERN Todo endpoints.
 */

export class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} requestContext
   * @param {string} [baseURL]
   */
  constructor(requestContext, baseURL = '') {
    this.request = requestContext;
    this.baseURL = baseURL;
  }

  _url(path) {
    if (!this.baseURL || path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  // --- Health Endpoint ---
  async getHealth() {
    return this.request.get(this._url('/health'));
  }

  // --- Auth Endpoints ---
  async register(userData) {
    return this.request.post(this._url('/api/auth/register'), {
      data: userData,
    });
  }

  async login(credentials) {
    return this.request.post(this._url('/api/auth/login'), {
      data: credentials,
    });
  }

  async logout() {
    return this.request.post(this._url('/api/auth/logout'));
  }

  async getMe() {
    return this.request.get(this._url('/api/auth/me'));
  }

  // --- Todo Endpoints ---
  async getTodos() {
    return this.request.get(this._url('/api/todos'));
  }

  async createTodo(payload) {
    return this.request.post(this._url('/api/todos'), {
      data: payload,
    });
  }

  async updateTodo(id, payload) {
    return this.request.put(this._url(`/api/todos/${id}`), {
      data: payload,
    });
  }

  async toggleTodo(id) {
    return this.request.patch(this._url(`/api/todos/${id}/toggle`));
  }

  async deleteTodo(id) {
    return this.request.delete(this._url(`/api/todos/${id}`));
  }
}
