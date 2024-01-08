const ErrorHandler = require('../utils/errorHandler');
const Product = require('./../model/productModel');
const catchAsyncError = require('./../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');
const Order = require('./../model/orderModel');

const newOrder = catchAsyncError(async (req, res, next) => {
  const { shippingInfo, orderItems, paymentInfo, itemsPrice } = req.body;

  const user = req.user.id; // Assuming user ID is attached to the request by the authentication middleware

  const order = await Order.create({
    shippingInfo,
    orderItems,
    user,
    paymentInfo,
    itemsPrice,
  });

  res.status(201).json({ success: true, order });
});

const getOrderById = catchAsyncError(async (req, res, next) => {
  const orderId = req.params.orderId;

  const order = await Order.findById(orderId).populate({
    path: 'user',
    select: 'name email',
  });

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  res.status(200).json({ success: true, order });
});

const myOrders = catchAsyncError(async (req, res, next) => {
  const userId = req.user.id;

  const orders = await Order.find({ user: userId });

  res.status(200).json({ success: true, orders });
});

const getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;
  orders.forEach((order) => {
    order.orderItems.forEach((orderItem) => {
      totalAmount += orderItem.price * orderItem.quantity;
    });
  });

  res.status(200).json({ success: true, totalAmount, orders });
});

const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const { orderId, status } = req.body;

  // Fetch the order details including the products and quantities
  const order = await Order.findById(orderId).populate('orderItems.product');

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (status === 'Paid') {
    // Update product quantities
    order.orderItems.forEach(async (orderItem) => {
      const product = orderItem.product;

      // Check if the product is found
      if (!product) {
        return next(new ErrorHandler('Product not found', 404));
      }

      // Check if the product has sufficient quantity
      if (product.stock >= orderItem.quantity) {
        product.stock -= orderItem.quantity;
      } else {
        return next(
          new ErrorHandler('Insufficient stock for the product', 400)
        );
      }
    });

    // Save changes to products
    await Promise.all(
      order.orderItems.map((orderItem) => orderItem.product.save())
    );
  }

  // Update order status
  order.status = status;

  // Save changes to the order
  await order.save();

  res
    .status(200)
    .json({ success: true, message: 'Order status updated successfully' });
});

module.exports = {
  newOrder,
  getOrderById,
  myOrders,
  getAllOrders,
  updateOrderStatus,
};
