const express = require('express');
const router = express.Router();
const { protect, isBuyer, isSeller, isInspector } = require('../middleware/auth');
// Corrected path to import upload middleware from cloudinary config
const { upload } = require('../config/cloudinary'); 
const {
    submitProperty,
    getInspectorProperties,
    getAllPendingProperties,
    verifyProperty,
    getUserProperties,
    getInspectorPropertiesByWallet,
    updateInspectionStatus,
    listProperty,
    buyProperty,
    getProperties,
    getProperty
} = require('../controllers/propertyController');

// --- Define routes from most specific to most general --- 

// GET specific collections or filtered lists
router.get('/inspector', protect, isInspector, getInspectorProperties);
router.get('/inspector/:walletAddress', getInspectorPropertiesByWallet);
router.get('/user', protect, getUserProperties);
router.get('/pending', protect, isInspector, getAllPendingProperties);
router.get('/', getProperties); // Get all public properties

// POST routes for creating/acting
router.post('/', protect, isSeller, upload.single('image'), submitProperty);
router.post('/:id/buy', protect, isBuyer, buyProperty); // Changed middleware
router.post('/:id/verify', protect, isInspector, verifyProperty);

// PUT routes for updates
router.put('/:id/inspection-status', updateInspectionStatus); 

// GET single item by ID (defined LAST among GET routes)
router.get('/:id', getProperty);

// Maybe other routes like listing/unlisting?
// router.put('/:id/list', protect, isBuyer, listProperty); 

module.exports = router; 