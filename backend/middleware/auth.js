const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check if wallet is connected
            if (req.headers.walletaddress && req.user.walletAddress !== req.headers.walletaddress) {
                return res.status(401).json({ message: 'Wallet address mismatch' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const isBuyer = (req, res, next) => {
    if (req.user && req.user.role === 'buyer') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a buyer' });
    }
};

const isSeller = (req, res, next) => {
    if (req.user && req.user.role === 'seller') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a seller' });
    }
};

const isInspector = (req, res, next) => {
    if (req.user && req.user.role === 'inspector') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an inspector' });
    }
};

module.exports = { protect, isBuyer, isSeller, isInspector }; 