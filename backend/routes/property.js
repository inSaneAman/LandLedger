const express = require('express');
const router = express.Router();
const { protect, isInspector } = require('../middleware/auth');
const {
    submitProperty,
    getInspectorProperties,
    verifyProperty,
    getUserProperties,
    getInspectorPropertiesByWallet,
    updateInspectionStatus
} = require('../controllers/propertyController');

// Property submission route
router.post('/', protect, submitProperty);

// Get inspector's assigned properties
router.get('/inspector', protect, isInspector, getInspectorProperties);

// Get inspector's properties by wallet address
router.get('/inspector/:walletAddress', getInspectorPropertiesByWallet);

// Update property inspection status
router.put('/:id/inspection-status', updateInspectionStatus);

// Verify a property
router.put('/:id/verify', protect, isInspector, verifyProperty);

// Get user's properties
router.get('/user', protect, getUserProperties);

module.exports = router; 