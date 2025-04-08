const Property = require('../models/Property');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Submit a new property
// @route   POST /api/properties
// @access  Private
const submitProperty = async (req, res) => {
    try {
        // Log the entire request for debugging
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        // Extract data from form fields
        const {
            landName,
            title,
            description,
            location,
            size,
            price,
            documents,
            ownerWalletAddress
        } = req.body;

        // Validate required fields
        if (!landName || !title || !description || !location || !size || !price || !ownerWalletAddress) {
            return res.status(400).json({ 
                message: 'Please provide all required fields',
                missingFields: {
                    landName: !landName,
                    title: !title,
                    description: !description,
                    location: !location,
                    size: !size,
                    price: !price,
                    ownerWalletAddress: !ownerWalletAddress
                }
            });
        }

        // Find inspector based on property location
        const inspector = await User.findOne({
            role: 'inspector',
            areaOfInspection: location
        });

        if (!inspector) {
            return res.status(404).json({ message: 'No inspector found for this area' });
        }

        // Handle image upload if present
        let imageData = {};
        if (req.file) {
            try {
                imageData = {
                    url: req.file.path,
                    publicId: req.file.filename
                };
            } catch (uploadError) {
                console.error('Error processing image:', uploadError);
                return res.status(500).json({ 
                    message: 'Error processing image',
                    error: process.env.NODE_ENV === 'development' ? uploadError : undefined
                });
            }
        } else {
            return res.status(400).json({ message: 'Property image is required' });
        }

        // Parse documents if provided
        let parsedDocuments = [];
        if (documents) {
            try {
                parsedDocuments = JSON.parse(documents);
            } catch (parseError) {
                console.error('Error parsing documents:', parseError);
                parsedDocuments = [];
            }
        }

        const property = await Property.create({
            owner: req.user._id,
            ownerWalletAddress,
            landName,
            title,
            description,
            location,
            size: Number(size),
            price: Number(price),
            documents: parsedDocuments,
            image: imageData,
            inspector: inspector._id,
            status: 'pending',
            verifiedByInspector: false
        });

        // Update inspector's assigned properties
        inspector.assignedProperties.push(property._id);
        await inspector.save();

        res.status(201).json(property);
    } catch (error) {
        console.error('Error submitting property:', error);
        res.status(500).json({ 
            message: error.message || 'Error submitting property',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// @desc    Get all properties for an inspector
// @route   GET /api/properties/inspector
// @access  Private (Inspector only)
const getInspectorProperties = async (req, res) => {
    try {
        const properties = await Property.find({ inspector: req.user._id });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify a property
// @route   PUT /api/properties/:id/verify
// @access  Private (Inspector only)
const verifyProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.inspector.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to verify this property' });
        }

        const { status, inspectionNotes } = req.body;

        property.status = status;
        property.inspectionNotes = inspectionNotes;
        property.verificationDate = Date.now();
        property.verifiedByInspector = true;

        await property.save();

        res.json(property);
    } catch (error) {
        console.error('Error verifying property:', error);
        res.status(500).json({ 
            message: error.message || 'Error verifying property',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// @desc    Get all properties for a user
// @route   GET /api/properties/user
// @access  Private
const getUserProperties = async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user._id });
        res.json(properties);
    } catch (error) {
        console.error('Error getting user properties:', error);
        res.status(500).json({ 
            message: error.message || 'Error getting user properties',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

module.exports = {
    submitProperty,
    getInspectorProperties,
    verifyProperty,
    getUserProperties
}; 