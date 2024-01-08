const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('./catchAsyncError');
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');

const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler('Please Login to access this resource', 401));
  }
  const decodeData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodeData._id);
  next();
});

const authorizeRoles = (role) => {
  return (req, res, next) => {
    // Assuming that user information is attached to the request object by the authentication middleware
    const userRole = req.user.role;
    // Check if the user has the required role
    if (userRole !== role) {
      return next(
        new ErrorHandler(
          `Role: ${userRole} is not allowed to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { isAuthenticatedUser, authorizeRoles };
