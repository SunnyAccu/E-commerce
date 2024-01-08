const ErrorHandler = require('./../utils/errorHandler');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // wrong mongodb error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // mongoose duplicate error

  // if (err.code === 11000) {
  //   const message = `Duplicate Email Id: ${Object.keys(err.keyValue)}`;
  //   err = new ErrorHandler(message, 400);
  // }
  if (err.name === 'JsonWebTokenError') {
    const message = `Json token is not valid try again`;
    err = new ErrorHandler(message, 400);
  }

  /// expire
  if (err.name === 'JsonExpiredError') {
    const message = `Json web token is expired`;
    err = new ErrorHandler(message, 400);
  }
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};
