const express = require('express');
const {
  newOrder,
  getOrderById,
  myOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controller/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/:orderId').get(isAuthenticatedUser, getOrderById);
router.route('/my').get(isAuthenticatedUser, myOrders);
router
  .route('/getAllOrders')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router
  .route('/updateStatus')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);

module.exports = router;
