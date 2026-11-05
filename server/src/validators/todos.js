const { body, param } = require('express-validator');

const todoIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Todo ID must be a positive integer'),
];

const createTodoValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be 1–100 characters'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
];

const updateTodoValidators = [
  ...todoIdValidator,
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be 1–100 characters'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
];

module.exports = { todoIdValidator, createTodoValidators, updateTodoValidators };

