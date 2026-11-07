/**
 * Shared test utility functions for data generation and test interactions.
 */

/**
 * Generates a unique, collision-resistant test email address.
 * @param {string} prefix
 * @returns {string}
 */
export const generateTestEmail = (prefix = 'auto') => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${randomSuffix}@example.com`;
};

/**
 * Generates a complete unique user registration payload.
 * @param {object} overrides
 * @returns {object}
 */
export const generateTestUser = (overrides = {}) => {
  const email = generateTestEmail('user');
  return {
    name: 'Automation User',
    email,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    ...overrides,
  };
};

/**
 * Generates a unique Todo creation payload.
 * @param {object} overrides
 * @returns {object}
 */
export const generateTodoPayload = (overrides = {}) => {
  const id = Date.now() % 100000;
  return {
    title: `Todo Item ${id}`,
    description: `Auto-generated test description for item ${id}`,
    ...overrides,
  };
};
