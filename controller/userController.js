const ErrorHandler = require('../utils/errorHandler');
const User = require('./../model/userModel');
const catchAsyncError = require('./../middleware/catchAsyncError');
const sendEmail = require('./../utils/sendemail');
const crypto = require('crypto');
/// Register user

const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: 'this is a sample id',
        url: 'profilepic',
      },
      role,
    });

    const token = user.generateAuthToken();

    res.status(201).json({ success: true, user, token });
  } catch (error) {
    // Check if the error is due to a duplicate key (email)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return next(new ErrorHandler('Email address is already registered', 400));
    }

    // Handle other errors
    return next(error);
  }
};

const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler('Please enter email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorHandler('Invalid Email or Password', 401));
  }

  const isPasswordMatched = await user.comparePassword(password, user.password);
  //                                                    ^^^^^^^^^^^^^^^^^^^^
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid Email or Password', 401));
  }

  const token = user.generateAuthToken();

  res.cookie('token', token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Cookie expiration time (7 days)
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production', // Set to true in production for HTTPS
  });

  res.status(200).json({ success: true, token });
});

const logout = catchAsyncError(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged Out Successfully',
  });
});

const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  const resetToken = user.generateResetToken();
  console.log('hii', resetToken);

  await user.save({ validateBeforeSave: false });

  const resetURL = `http://localhost/api/v1/password/reset/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of the password for your account.\n\nPlease click on the following link or paste it into your browser to complete the process:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Ecommerce Password Recovery',
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        'Reset Password Token is invalid or has been expired',
        404
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not matched', 400));
  }
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();
  const token = user.generateAuthToken();

  res.status(201).json({ success: true, user, token });
});

const getUserDeatils = catchAsyncError(async (req, res) => {
  console.log(req.user);
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

const updatePassword = catchAsyncError(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Verify the current password
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword, user.password))) {
    return res
      .status(401)
      .json({ success: false, error: 'Invalid current password' });
  }

  // Update the password
  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: 'Password updated successfully' });
});

const updateUserDetails = catchAsyncError(async (req, res) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
  };
  const userId = req.user.id;

  // Find the user by ID
  const user = await User.findByIdAndUpdate(userId, newUser, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.status(200).json({ success: true, user });
});

const getAllUser = catchAsyncError(async (req, res) => {
  // Find the user by ID
  const user = await User.find();

  res.status(200).json({ success: true, user });
});

const getSingleUser = catchAsyncError(async (req, res) => {
  // Find the user by ID
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.status(200).json({ success: true, user });
});

// by admin

const updateUserRole = catchAsyncError(async (req, res) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const userId = req.params.id;

  // Find the user by ID
  const user = await User.findByIdAndUpdate(userId, newUser, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.status(200).json({ success: true, user });
});

// admin can delete the user

const deleteUser = catchAsyncError(async (req, res) => {
  // Find the user by ID
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res
      .status(404)
      .json({ success: false, error: `User not found ${req.params.id}` });
  }

  res
    .status(200)
    .json({ success: true, message: 'User has been deleted Succesfully' });
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDeatils,
  updatePassword,
  updateUserDetails,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
};
