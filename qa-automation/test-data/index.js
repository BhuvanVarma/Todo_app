/**
 * Centralized test data fixtures, constants, boundaries, and validation payloads.
 */

export const testUsers = {
  valid: {
    name: 'Automation Tester',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  },
  shortPassword: {
    name: 'Short Pass User',
    password: 'pass1',
    confirmPassword: 'pass1',
  },
  noNumberPassword: {
    name: 'No Number User',
    password: 'PasswordOnly',
    confirmPassword: 'PasswordOnly',
  },
  noLetterPassword: {
    name: 'No Letter User',
    password: '1234567890',
    confirmPassword: '1234567890',
  },
  shortName: {
    name: 'A',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  },
  longName: {
    name: 'A'.repeat(51),
    password: 'Password123!',
    confirmPassword: 'Password123!',
  },
  invalidEmails: [
    'plainaddress',
    '@missingusername.com',
    'username@.com',
    'username@domain..com',
  ],
};

export const testTodos = {
  standard: {
    title: 'Automated Test Todo',
    description: 'Detailed description created by Playwright automation suite',
  },
  titleOnly: {
    title: 'Quick Single Item Todo',
  },
  boundaryMax: {
    title: 'T'.repeat(100),
    description: 'D'.repeat(500),
  },
  boundaryOverTitle: {
    title: 'T'.repeat(101),
  },
  boundaryOverDescription: {
    title: 'Valid Title',
    description: 'D'.repeat(501),
  },
  updated: {
    title: 'Updated Todo Title',
    description: 'Updated description content',
  },
};
