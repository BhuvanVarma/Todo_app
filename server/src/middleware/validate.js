const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chains; returns 400 with structured errors
 * if any validation failed.
 */
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return res.status(400).json({ errors });
  }
  next();
}

module.exports = validate;

