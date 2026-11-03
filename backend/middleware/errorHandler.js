const errorHandler = (err, req, res, next) => {
  const statusCode = err.code === 'ER_DUP_ENTRY'
    ? 409
    : err.code === 'ER_DATA_TOO_LONG'
      ? 400
      : Number.isInteger(err.statusCode)
    ? err.statusCode
    : Number.isInteger(err.status)
      ? err.status
      : 500;
  if (statusCode >= 500) {
    console.error('Unhandled error:', err);
  }
  const message = statusCode >= 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message || 'Internal server error',
  });
};

module.exports = errorHandler;
