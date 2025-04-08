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
        const { walletAddress, role, areaOfInspection } = req.body;
        console.log('Registration attempt with data:', { walletAddress, role, areaOfInspection });

        // Validate required fields
        if (!walletAddress) {
            return res.status(400).json({ message: 'Wallet address is required' });
        }

        // Validate role
        if (!['buyer', 'seller', 'inspector', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Validate areaOfInspection for inspectors
        if (role === 'inspector') {
            if (!areaOfInspection) {
                return res.status(400).json({ message: 'Area of inspection is required for inspectors' });
            }
            if (!['residential', 'commercial', 'industrial', 'agricultural', 'mixed'].includes(areaOfInspection)) {
                return res.status(400).json({ message: 'Invalid area of inspection' });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ walletAddress });
        if (existingUser) {
            console.log('User already exists with wallet:', walletAddress);
            return res.status(400).json({ message: 'Wallet address already registered' });
        }
        
        // Create user object based on role
        const userData = {
            walletAddress,
            role,
            areaOfInspection: role === 'inspector' ? areaOfInspection : null,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
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
            lastLogin: user.lastLogin,
            areaOfInspection: user.areaOfInspection,
            token
        });
    } catch (error) {
        console.error('Registration error details:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        
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

module.exports = {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserRole,
    updateWalletAddress
}; 