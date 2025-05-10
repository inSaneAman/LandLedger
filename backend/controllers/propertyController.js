const Property = require('../models/Property');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Submit a new property
// @route   POST /api/properties
// @access  Private (Buyer Only - Assuming role check happens in middleware)
const submitProperty = async (req, res) => {
    try {
        // Log the received data for debugging
        console.log('Request body received:', req.body);
        console.log('Request file received:', req.file);

        // Extract data from form fields (using names sent by frontend)
        const {
            title,
            description,
            location,
            area, // Changed from size
            price,
            propertyType,
            ownerWalletAddress,
            landId,          // Added
            transactionHash  // Added
        } = req.body;

        // Validate required fields sent by the frontend
        if (!title || !description || !location || !area || !price || !propertyType || !ownerWalletAddress || !landId || !transactionHash) {
            return res.status(400).json({ 
                message: 'Please provide all required fields',
                missingFields: {
                    title: !title,
                    description: !description,
                    location: !location,
                    area: !area,
                    price: !price,
                    propertyType: !propertyType,
                    ownerWalletAddress: !ownerWalletAddress,
                    landId: !landId,
                    transactionHash: !transactionHash
                }
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: 'Property image is required' });
        }

        // Find inspector based on property location (assuming this logic remains)
        const inspector = await User.findOne({
            role: 'inspector',
            areaOfInspection: location
        });

        if (!inspector) {
            // Consider if this should be an error or if property can be added without an inspector initially
            console.warn(`No inspector found for area: ${location}. Property will be added without an assigned inspector.`);
            // return res.status(404).json({ message: 'No inspector found for this area' });
        }

        // Handle image upload (already using cloudinary via middleware)
        const imageData = {
            url: req.file.path,
            publicId: req.file.filename
        };

        const propertyData = {
            owner: req.user._id, // Assuming user ID is attached by auth middleware
            ownerWalletAddress,
            title,           // Use title
            description,
            location,
            area: Number(area), // Use area
            price: Number(price),
            propertyType,    // Added
            landId,          // Added
            transactionHash, // Added
            image: imageData,
            inspector: inspector ? inspector._id : null, // Handle case where inspector is not found
            status: 'pending', // Default status
            isListed: false, // Default isListed status
            verifiedByInspector: false // Default verification status
            // Removed: landName, documents
        };

        // Debug log for the data being sent to the database
        console.log("Creating property with data:", propertyData);

        const property = await Property.create(propertyData);

        // Update inspector's assigned properties if an inspector was found
        if (inspector) {
            inspector.assignedProperties.push(property._id);
            await inspector.save();
        }

        res.status(201).json(property);
    } catch (error) {
        console.error('Error submitting property:', error);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: error.errors 
            });
        }
        
        res.status(500).json({ 
            message: error.message || 'Error submitting property',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// @desc    Get all properties for an inspector (PENDING verification)
// @route   GET /api/properties/inspector
// @access  Private (Inspector only)
const getInspectorProperties = async (req, res) => {
    try {
        // Find properties assigned to the inspector with status 'pending'
        const properties = await Property.find({ 
            inspector: req.user._id,
            status: 'pending' 
        })
        .populate('owner', 'walletAddress') // Populate owner wallet address
        .sort({ createdAt: 1 }); // Sort by oldest first

        res.json(properties || []); // Ensure an array is always returned
    } catch (error) {
        console.error('Error fetching inspector properties:', error);
        res.status(500).json({ 
            message: error.message || 'Error fetching assigned properties' 
        });
    }
};

// @desc    Verify a property
// @route   PUT /api/properties/:id/verify
// @access  Private (Inspector only)
const verifyProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        console.log(`Received request to verify property ID: ${propertyId}`);

        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const { status, inspectionNotes } = req.body;
        
        // Validate status
        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        property.status = status;
        property.inspectionNotes = inspectionNotes;
        property.verificationDate = Date.now();
        property.verifiedByInspector = (status === 'verified'); 
        // Optionally, record which inspector verified it
        property.inspectorWhoVerified = req.user._id; 

        await property.save();

        res.json(property);
    } catch (error) {
        console.error('Error verifying property:', error);
        // Handle CastError if ID format is invalid
        if (error.name === 'CastError') {
            console.error(`Invalid ID format received: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid property ID format' });
        }
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

// @desc    Get all properties for an inspector by wallet address
// @route   GET /api/properties/inspector/:walletAddress
// @access  Public
const getInspectorPropertiesByWallet = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        // Find inspector by wallet address
        const inspector = await User.findOne({ 
            walletAddress,
            role: 'inspector'
        });

        if (!inspector) {
            return res.status(404).json({ message: 'Inspector not found' });
        }

        // Get all properties assigned to this inspector
        const properties = await Property.find({ inspector: inspector._id })
            .populate('owner', 'walletAddress')
            .sort({ createdAt: -1 });

        res.json(properties);
    } catch (error) {
        console.error('Error getting inspector properties:', error);
        res.status(500).json({ 
            message: error.message || 'Error getting inspector properties',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// @desc    Update property inspection status
// @route   PUT /api/properties/:id/inspection-status
// @access  Public
const updateInspectionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, inspectedAt, inspectorWallet } = req.body;

        // Find the property
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Find inspector by wallet address
        const inspector = await User.findOne({ 
            walletAddress: inspectorWallet,
            role: 'inspector'
        });

        if (!inspector) {
            return res.status(404).json({ message: 'Inspector not found' });
        }

        // Verify this inspector is assigned to this property
        if (property.inspector.toString() !== inspector._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }

        // Update property status and verification details
        property.status = status;
        property.verificationDate = inspectedAt;
        property.verifiedByInspector = true;
        property.updatedAt = new Date();

        // Save the updated property
        const updatedProperty = await property.save();

        res.json(updatedProperty);
    } catch (error) {
        console.error('Error updating inspection status:', error);
        res.status(500).json({ 
            message: error.message || 'Error updating inspection status',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// @desc    List a property (Buyer)
// @route   POST /api/properties
// @access  Private/Buyer
const listProperty = async (req, res) => {
    try {
        if (req.user.role !== 'buyer') {
            return res.status(403).json({ message: 'Only buyers can list properties' });
        }

        const property = await Property.create({
            ...req.body,
            owner: req.user._id,
            ownerWalletAddress: req.user.walletAddress,
            isListed: true
        });

        res.status(201).json({
            success: true,
            data: property
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Buy a property (Seller)
// @route   POST /api/properties/:id/buy
// @access  Private/Seller
const buyProperty = async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Only sellers can buy properties' });
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (!property.isVerified) {
            return res.status(400).json({ message: 'Property must be verified before purchase' });
        }

        // Update property ownership
        property.owner = req.user._id;
        property.ownerWalletAddress = req.user.walletAddress;
        property.isListed = false;
        await property.save();

        res.status(200).json({
            success: true,
            message: 'Property purchased successfully',
            data: property
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all properties (for public listing)
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
    try {
        // Find all properties, potentially filtering later (e.g., only isListed=true)
        const properties = await Property.find({})
            .populate('owner', 'walletAddress') // Optionally populate owner info
            .sort({ createdAt: -1 }); // Sort by newest first
        
        // Ensure we always return an array
        res.json(properties || []);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ 
            message: error.message || 'Error fetching properties',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// @desc    Get a single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'walletAddress')
            .populate('inspector', 'walletAddress'); // Populate inspector details too

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json(property);
    } catch (error) {
        console.error('Error fetching single property:', error);
        // Handle CastError if ID format is invalid
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid property ID format' });
        }
        res.status(500).json({ 
            message: error.message || 'Error fetching property',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// @desc    Get ALL properties pending verification
// @route   GET /api/properties/pending
// @access  Private (Inspector Only)
const getAllPendingProperties = async (req, res) => {
    try {
        // Find all properties with status 'pending'
        const properties = await Property.find({ status: 'pending' })
            .populate('owner', 'walletAddress') 
            .populate('inspector', 'walletAddress') // Populate assigned inspector wallet address too
            .sort({ createdAt: 1 }); // Sort by oldest first

        res.json(properties || []); // Ensure an array is always returned
    } catch (error) {
        console.error('Error fetching all pending properties:', error);
        res.status(500).json({ 
            message: error.message || 'Error fetching pending properties' 
        });
    }
};

module.exports = {
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
}; 