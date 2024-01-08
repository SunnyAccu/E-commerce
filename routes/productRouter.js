const express = require('express');
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteProductReview,
} = require('../controller/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.route('/products').get(getAllProducts);
router
  .route('/admin/product/new')
  .post(isAuthenticatedUser, authorizeRoles('admin'), createProduct);
router
  .route('/admin/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.route('/productDetail/:id').get(getProductDetails);
router
  .route('/reviews/:productId')
  .post(isAuthenticatedUser, createProductReview);
router
  .route('/products/:productId/reviews')
  .get(isAuthenticatedUser, getProductReviews);
router
  .route('/products/:productId/reviews/:reviewId')
  .delete(isAuthenticatedUser, deleteProductReview);
module.exports = router;
