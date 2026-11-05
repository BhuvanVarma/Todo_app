const { body } = require('express-validator');

const registerValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  // notEmpty first, then isEmail, then lower-case the value ourselves.
  // We intentionally do NOT use normalizeEmail() because validator.js's
  // normalizeEmail() can return the boolean `false` for certain valid-looking
  // emails (e.g. unusual TLDs), which causes a PostgreSQL type error when
  // used as a VARCHAR query parameter.
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .customSanitizer((value) => value.toLowerCase()),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8–72 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .customSanitizer((value) => value.toLowerCase()),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidators, loginValidators };

