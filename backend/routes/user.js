const express = require('express');
const router = express.Router();
const {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserRole,
    updateWalletAddress,
    checkWalletExists,
    getUsers,
    updateUserVerification
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.post('/login', loginUser);
router.post('/register', upload.single('image'), registerUser);
router.get('/wallet/:address', checkWalletExists);
router.get('/allusers',getUsers)
router.put('/verification',updateUserVerification)

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/role', protect, updateUserRole);
router.put('/wallet', protect, updateWalletAddress);

module.exports = router; 