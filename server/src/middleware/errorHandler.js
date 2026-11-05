// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Always log the full error on the server so you can see the real cause.
  console.error(`[ERROR] ${req.method} ${req.path}`, err);

  const status = err.status || 500;

  // In development expose the actual error message so bugs are visible.
  // In production always hide internals.
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ errors: [{ message }] });
}

function notFound(req, res) {
  res.status(404).json({ errors: [{ message: `Route ${req.method} ${req.path} not found` }] });
}

module.exports = { errorHandler, notFound };

