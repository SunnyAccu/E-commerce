const mongoose = require('mongoose');

// Create a Mongoose schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5'],
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    enum: ['Electronics', 'Clothing', 'Books', 'Other'],
    required: [true, 'Product category is required'],
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    max: [1000, 'Stock cannot exceed 1000'],
  },
  numberOfReviews: {
    type: Number,
    default: 0,
    min: [0, 'Number of reviews cannot be negative'],
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: [1, 'Rating cannot be less than 1'],
        max: [5, 'Rating cannot be more than 5'],
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a Mongoose model
const Product = mongoose.model('Product', productSchema);

// Export the model
module.exports = Product;
