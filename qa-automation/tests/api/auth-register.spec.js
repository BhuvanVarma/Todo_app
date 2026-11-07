import { test, expect } from '../../fixtures/index.js';
import { generateTestUser, generateTestEmail } from '../../utils/index.js';
import { testUsers } from '../../test-data/index.js';

test.describe('API - User Registration (/api/auth/register)', () => {
  test('API-REG-001: Register successfully with valid payload (201 Created)', async ({ apiClient }) => {
    const userData = generateTestUser();
    const res = await apiClient.register(userData);

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.id).toBeGreaterThan(0);
    expect(body.user.name).toBe(userData.name);
    expect(body.user.email).toBe(userData.email.toLowerCase());
    expect(body.user.createdAt).toBeDefined();
    // Security check: password_hash must never be leaked
    expect(body.user.password_hash).toBeUndefined();
    expect(body.user.password).toBeUndefined();

    // Check Set-Cookie header contains token
    const setCookie = res.headers()['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('token=');
    expect(setCookie.toLowerCase()).toContain('httponly');
  });

  test('API-REG-002: Reject duplicate email registration (409 Conflict)', async ({ apiClient }) => {
    const userData = generateTestUser();
    // First registration
    const res1 = await apiClient.register(userData);
    expect(res1.status()).toBe(201);

    // Second registration with duplicate email
    const res2 = await apiClient.register(userData);
    expect(res2.status()).toBe(409);
    const body = await res2.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email', message: 'Email already in use' }),
      ])
    );
  });

  test('API-REG-003: Reject registration with missing required fields (400 Bad Request)', async ({ apiClient }) => {
    const res = await apiClient.register({});
    expect(res.status()).toBe(400);
    const body = await res.json();
    const fields = body.errors.map((e) => e.field);
    expect(fields).toContain('name');
    expect(fields).toContain('email');
    expect(fields).toContain('password');
    expect(fields).toContain('confirmPassword');
  });

  test('API-REG-004: Reject registration with short name (400 Bad Request)', async ({ apiClient }) => {
    const userData = generateTestUser(testUsers.shortName);
    const res = await apiClient.register(userData);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name', message: 'Name must be 2–50 characters' }),
      ])
    );
  });

  test('API-REG-005: Reject registration with invalid email formats (400 Bad Request)', async ({ apiClient }) => {
    for (const invalidEmail of testUsers.invalidEmails) {
      const userData = generateTestUser({ email: invalidEmail });
      const res = await apiClient.register(userData);
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email', message: 'Invalid email format' }),
        ])
      );
    }
  });

  test('API-REG-006: Reject registration with short password (<8 chars) (400 Bad Request)', async ({ apiClient }) => {
    const userData = generateTestUser(testUsers.shortPassword);
    const res = await apiClient.register(userData);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password', message: 'Password must be 8–72 characters' }),
      ])
    );
  });

  test('API-REG-007: Reject registration with password missing numbers (400 Bad Request)', async ({ apiClient }) => {
    const userData = generateTestUser(testUsers.noNumberPassword);
    const res = await apiClient.register(userData);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password', message: 'Password must contain at least one number' }),
      ])
    );
  });

  test('API-REG-008: Reject registration with password missing letters (400 Bad Request)', async ({ apiClient }) => {
    const userData = generateTestUser(testUsers.noLetterPassword);
    const res = await apiClient.register(userData);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password', message: 'Password must contain at least one letter' }),
      ])
    );
  });

  test('API-REG-009: Reject registration with mismatched confirmPassword (400 Bad Request)', async ({ apiClient }) => {
    const userData = generateTestUser({
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
    });
    const res = await apiClient.register(userData);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'confirmPassword', message: 'Passwords do not match' }),
      ])
    );
  });
});
