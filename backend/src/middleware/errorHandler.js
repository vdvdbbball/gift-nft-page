const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.validationError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details
    });
  }

  if (err.status === 401) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message
    });
  }

  if (err.status === 403) {
    return res.status(403).json({
      error: 'Forbidden',
      message: err.message
    });
  }

  if (err.status === 404) {
    return res.status(404).json({
      error: 'Not found',
      message: err.message
    });
  }

  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;
