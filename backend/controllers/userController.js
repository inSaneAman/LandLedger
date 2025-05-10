const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Login user with wallet
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { walletAddress } = req.body;

        // Find user by wallet address
        const user = await User.findOne({ walletAddress });

        // If user doesn't exist, return 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update last login
        await user.updateLastLogin();

        // Return user data and token
        res.json({
            _id: user._id,
            walletAddress: user.walletAddress,
            role: user.role,
            status: user.status,
            lastLogin: user.lastLogin,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// @desc    Register new user with wallet
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        // Log the entire request to see the structure
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        // Extract form data fields directly from req.body
        const { walletAddress, role, areaOfInspection } = req.body;

        // Log the extracted data
        console.log('Extracted form data:', {
            walletAddress,
            role,
            areaOfInspection
        });

        // Validate required fields
        if (!walletAddress) {
            return res.status(400).json({ message: 'Wallet address is required' });
        }

        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }

        // Validate role
        if (!['buyer', 'seller', 'inspector'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ walletAddress });
        if (existingUser) {
            console.log('User already exists with wallet:', walletAddress);
            return res.status(400).json({ message: 'Wallet address already registered' });
        }

        // Handle image upload
        let imageData = null;
        if (req.file) {
            imageData = {
                url: req.file.path,
                publicId: req.file.filename
            };
            console.log('Image uploaded successfully:', imageData);
        } else {
            console.log('No image uploaded');
        }
        
        // Create user object
        const userData = {
            walletAddress,
            role,
            areaOfInspection: role === 'inspector' ? areaOfInspection : undefined,
            image: imageData,
            isVerified: false, // Default to unverified
            verificationDate: null,
            verificationNotes: null
        };

        console.log('Attempting to create user with data:', userData);

        // Create new user
        const user = await User.create(userData);
        console.log('User created successfully:', user._id);

        // Generate token
        const token = generateToken(user._id);

        // Return user data and token
        res.status(201).json({
            _id: user._id,
            walletAddress: user.walletAddress,
            role: user.role,
            status: user.status,
            areaOfInspection: user.areaOfInspection,
            image: user.image,
            isVerified: user.isVerified,
            verificationDate: user.verificationDate,
            verificationNotes: user.verificationNotes,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Wallet address already registered',
                error: 'Duplicate wallet address'
            });
        }
        
        res.status(500).json({ 
            message: 'Server error during registration', 
            error: error.message 
        });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                walletAddress: user.walletAddress,
                role: user.role,
                status: user.status,
                lastLogin: user.lastLogin,
                areaOfInspection: user.areaOfInspection
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/users/role
// @access  Private
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate new role
        if (!['buyer', 'seller', 'inspector', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        user.role = role;
        await user.save();

        res.json({
            _id: user._id,
            walletAddress: user.walletAddress,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update wallet address
// @route   PUT /api/users/wallet
// @access  Private
const updateWalletAddress = async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if wallet is already registered
        const walletExists = await User.findOne({ walletAddress });
        if (walletExists && walletExists._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: 'Wallet address already registered' });
        }

        user.walletAddress = walletAddress;
        await user.save();

        res.json({
            _id: user._id,
            walletAddress: user.walletAddress
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Check if wallet exists and return user data
// @route   GET /api/users/wallet/:address
// @access  Public
const checkWalletExists = async (req, res) => {
    try {
        const walletAddress = req.params.address;
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token for existing user
        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            walletAddress: user.walletAddress,
            role: user.role,
            status: user.status,
            token
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .select('-password') // Exclude password field
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments();

        res.json({
            users,
            page,
            pages: Math.ceil(totalUsers / limit),
            total: totalUsers
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// @desc    Update user verification status
// @route   PUT /api/users/:id/verify
// @access  Private/Admin
const updateUserVerification = async (req, res) => {
    try {
        const { isVerified,walletAddress } = req.body;
        console.log(req.body)

        // Validate isVerified parameter
        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ 
                message: 'Invalid verification status. Must be a boolean value.' 
            });
        }

        // Find user by wallet address
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found with the provided wallet address.' 
            });
        }

        // Update verification status and notes
        user.isVerified = isVerified;
        user.verificationDate = isVerified ? new Date() : null;

        await user.save();

        res.json({
            _id: user._id,
            walletAddress: user.walletAddress,
            role: user.role,
            isVerified: user.isVerified,
            verificationDate: user.verificationDate,
            verificationNotes: user.verificationNotes
        });
    } catch (error) {
        console.error('Update verification error:', error);
        res.status(500).json({ 
            message: 'Failed to update user verification status.', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserRole,
    updateWalletAddress,
    checkWalletExists,
    getUsers,
    updateUserVerification
}; 