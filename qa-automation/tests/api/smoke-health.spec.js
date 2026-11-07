import { test, expect } from '../../fixtures/index.js';

test.describe('@smoke API Smoke Tests - Health & Liveness', () => {
  test('GET /health should return 200 OK with status: ok', async ({ apiClient }) => {
    // 1. Call GET /health
    const response = await apiClient.getHealth();

    // 2. Verify HTTP status code
    expect(response.status()).toBe(200);

    // 3. Verify content-type header
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');

    // 4. Verify response body
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
