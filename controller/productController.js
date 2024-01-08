const ErrorHandler = require('../utils/errorHandler');
const Product = require('./../model/productModel');
const catchAsyncError = require('./../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');

// create a product  -- admin

const createProduct = catchAsyncError(async (req, res, next) => {
  // Assuming req.user contains the authenticated user information
  req.body.user = req.user._id;

  const product = await Product.create(req.body);

  res.status(201).json({ success: true, product });
});

// get all products

const getAllProducts = catchAsyncError(async (req, res, next) => {
  const personCount = await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .paginate();
  const product = await apiFeature.query;
  res.status(200).json({ success: true, personCount, product });
});

// update product -- admin

const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  res.status(201).json({ success: true, product });
});

// delete product -- amdin

const deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  res
    .status(201)
    .json({ success: true, message: 'Your product has been deleted' });
});

// get single product detail

const getProductDetails = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  res.status(201).json({ success: true, product });
});

// add review to your product or update the review

const createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;
  const userId = req.user.id;

  // Find the product by ID
  const product = await Product.findById(productId);

  // Check if the product exists
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Check if the user has already reviewed the product
  const hasReviewed = product.reviews.some(
    (review) => review.user.toString() === userId
  );
  if (hasReviewed) {
    return next(
      new ErrorHandler('You have already reviewed this product', 400)
    );
  }

  // Create the review object
  const review = {
    user: userId,
    name: req.user.name,
    rating: parseInt(rating),
    comment,
  };

  // Add the review to the product's reviews array
  product.reviews.push(review);

  // Update the number of reviews and rating for the product
  product.numberOfReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((total, review) => total + review.rating, 0) /
    product.numberOfReviews;

  // Save the changes to the product
  await product.save();

  res
    .status(201)
    .json({ success: true, message: 'Review submitted successfully', review });
});

const getProductReviews = catchAsyncError(async (req, res, next) => {
  const productId = req.params.productId;

  // Find the product by ID
  const product = await Product.findById(productId);

  // Check if the product exists
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Retrieve the reviews for the product
  const reviews = product.reviews;

  res.status(200).json({ success: true, reviews });
});

const deleteProductReview = catchAsyncError(async (req, res, next) => {
  const productId = req.params.productId;
  const reviewId = req.params.reviewId;
  const userId = req.user.id;

  // Find the product by ID
  const product = await Product.findById(productId);

  // Check if the product exists
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Find the index of the review in the product's reviews array
  const reviewIndex = product.reviews.findIndex(
    (review) => review._id.toString() === reviewId
  );

  // Check if the review exists
  if (reviewIndex === -1) {
    return next(new ErrorHandler('Review not found', 404));
  }

  // Check if the user is the author of the review
  if (product.reviews[reviewIndex].user.toString() !== userId) {
    return next(
      new ErrorHandler('You are not authorized to delete this review', 403)
    );
  }

  // Remove the review from the array
  product.reviews.splice(reviewIndex, 1);

  // Update the number of reviews and rating for the product
  product.numberOfReviews = product.reviews.length;

  // Check if there are still reviews before calculating the average rating
  if (product.numberOfReviews > 0) {
    product.rating =
      product.reviews.reduce((total, review) => total + review.rating, 0) /
      product.numberOfReviews;
  } else {
    // If there are no reviews, set the rating to 0 or another default value
    product.rating = 0;
  }

  // Save the changes to the product
  await product.save();

  res
    .status(200)
    .json({ success: true, message: 'Review deleted successfully' });
});

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteProductReview,
};
