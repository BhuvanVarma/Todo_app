import { test, expect } from '../../fixtures/index.js';

test.describe('API - Auth Session & Verification (/api/auth/me & /api/auth/logout)', () => {
  test('API-SES-001: Retrieve current user profile when authenticated (200 OK)', async ({ registeredUser }) => {
    const res = await registeredUser.apiClient.getMe();
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.id).toBe(registeredUser.user.id);
    expect(body.user.email).toBe(registeredUser.user.email);
    expect(body.user.name).toBe(registeredUser.user.name);
  });

  test('API-SES-002: Reject session profile request without auth cookie (401 Unauthorized)', async ({ apiClient }) => {
    const res = await apiClient.getMe();
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Not authenticated' }),
      ])
    );
  });

  test('API-SES-003: Reject session profile with tampered/invalid token (401 Unauthorized)', async ({ request }) => {
    const res = await request.get('/api/auth/me', {
      headers: {
        Cookie: 'token=invalid.tampered.token;',
      },
    });
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Invalid or expired token' }),
      ])
    );
  });

  test('API-SES-004: Logout successfully and clear authentication cookie (200 OK)', async ({ registeredUser }) => {
    const logoutRes = await registeredUser.apiClient.logout();
    expect(logoutRes.status()).toBe(200);

    const body = await logoutRes.json();
    expect(body.message).toBe('Logged out');

    // Confirm session is no longer valid
    const meRes = await registeredUser.apiClient.getMe();
    expect(meRes.status()).toBe(401);
  });
});
