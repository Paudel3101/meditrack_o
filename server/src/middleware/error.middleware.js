const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') { status = 400; message = 'Validation Error: ' + err.message; }
  if (err.name === 'UnauthorizedError') { status = 401; message = 'Unauthorized: ' + err.message; }
  if (err.name === 'NotFoundError') { status = 404; message = 'Not Found: ' + err.message; }
  if (err.code === 'ER_DUP_ENTRY') { status = 409; message = 'Duplicate entry. This record already exists.'; }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') { status = 400; message = 'Invalid foreign key reference.'; }

  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { error: err.toString() })
  });
};

module.exports = { errorHandler };
