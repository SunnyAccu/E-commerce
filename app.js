const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error');
app.use(express.json());
app.use(cookieParser());

// routes
const productRoute = require('./routes/productRouter');
const userRoute = require('./routes/userRouter');
const orderRoute = require('./routes/orderRouter');
app.use('/api/v1', productRoute);
app.use('/api/v1', userRoute);
app.use('/api/v1', orderRoute);

// middlewarer for error

app.use(errorMiddleware);

module.exports = app;
