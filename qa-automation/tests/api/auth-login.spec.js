import { test, expect } from '../../fixtures/index.js';
import { generateTestUser, generateTestEmail } from '../../utils/index.js';

test.describe('API - User Login (/api/auth/login)', () => {
  test('API-LOG-001: Login successfully with valid credentials (200 OK)', async ({ apiClient }) => {
    // 1. Create user
    const userData = generateTestUser();
    await apiClient.register(userData);

    // 2. Perform login
    const res = await apiClient.login({
      email: userData.email,
      password: userData.password,
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(userData.email.toLowerCase());
    expect(body.user.name).toBe(userData.name);

    // Verify authentication cookie set
    const setCookie = res.headers()['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('token=');
  });

  test('API-LOG-002: Reject login with incorrect password (401 Unauthorized)', async ({ apiClient }) => {
    const userData = generateTestUser();
    await apiClient.register(userData);

    const res = await apiClient.login({
      email: userData.email,
      password: 'WrongPassword999!',
    });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Invalid email or password' }),
      ])
    );
  });

  test('API-LOG-003: Reject login with non-existent email (401 Unauthorized)', async ({ apiClient }) => {
    const nonExistentEmail = generateTestEmail('nonexistent');
    const res = await apiClient.login({
      email: nonExistentEmail,
      password: 'Password123!',
    });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Invalid email or password' }),
      ])
    );
  });

  test('API-LOG-004: Reject login with missing credentials (400 Bad Request)', async ({ apiClient }) => {
    const res = await apiClient.login({});
    expect(res.status()).toBe(400);
    const body = await res.json();
    const fields = body.errors.map((e) => e.field);
    expect(fields).toContain('email');
    expect(fields).toContain('password');
  });

  test('API-LOG-005: Reject login with malformed email format (400 Bad Request)', async ({ apiClient }) => {
    const res = await apiClient.login({
      email: 'notanemail',
      password: 'Password123!',
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email', message: 'Invalid email format' }),
      ])
    );
  });
});
