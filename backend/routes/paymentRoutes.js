const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Create a new payment order
router.post('/create-order', protect, paymentController.createOrder);

// Verify payment
router.post('/verify', protect, paymentController.verifyPayment);

module.exports = router; 