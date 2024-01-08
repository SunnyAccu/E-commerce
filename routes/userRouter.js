const express = require('express');
const {
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
  deleteUser,
  updateUserRole,
} = require('../controller/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/me').get(isAuthenticatedUser, getUserDeatils);
router.route('/updatePassword').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateUserDetails);
router
  .route('/admin/user')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUser);
router
  .route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser)
  .put(updateUserRole);

module.exports = router;
