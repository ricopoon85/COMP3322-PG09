const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  const statusCode = Number.isInteger(err.statusCode)
    ? err.statusCode
    : Number.isInteger(err.status)
      ? err.status
      : 500;
  const message = statusCode >= 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message || 'Internal server error',
  });
};

module.exports = errorHandler;
