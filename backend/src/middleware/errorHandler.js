/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a consistent response.
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Unhandled Error:', err.message);
  console.error(err.stack);

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate entry. A record with this value already exists.',
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referenced record does not exist.',
    });
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    return res.status(400).json({
      error: 'Invalid data. Check constraint violated.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
