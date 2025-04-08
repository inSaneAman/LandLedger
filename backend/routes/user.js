const express = require('express');
const router = express.Router();
const {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserRole,
    updateWalletAddress,
    checkWalletExists
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/wallet/:address', checkWalletExists);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/role', protect, updateUserRole);
router.put('/wallet', protect, updateWalletAddress);

module.exports = router; 