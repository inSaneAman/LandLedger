const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect, isBuyer } = require('../middleware/auth'); // Changed from isSeller to isBuyer

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order for property purchase
// @access  Private (Buyer Only)
router.post('/create-order', protect, isBuyer, createOrder);

// @route   POST /api/payments/verify-payment
// @desc    Verify Razorpay payment and update property status
// @access  Private (Buyer Only)
router.post('/verify-payment', protect, isBuyer, verifyPayment);

module.exports = router; 