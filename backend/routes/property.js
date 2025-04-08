const express = require('express');
const router = express.Router();
const { protect, isInspector } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
    submitProperty,
    getInspectorProperties,
    verifyProperty,
    getUserProperties
} = require('../controllers/propertyController');

// Property submission route with file upload
router.post('/', protect, upload.single('image'), submitProperty);

// Get inspector's assigned properties
router.get('/inspector', protect, isInspector, getInspectorProperties);

// Verify a property
router.put('/:id/verify', protect, isInspector, verifyProperty);

// Get user's properties
router.get('/user', protect, getUserProperties);

module.exports = router; 