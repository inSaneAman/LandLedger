const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ]
    },
    password: {
        type: String,
        required: false,
        minlength: 6,
        select: false
    },
    walletAddress: {
        type: String,
        required: [true, 'Please provide a wallet address'],
        unique: true
    },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'inspector'],
        required: [true, 'Please specify a role']
    },
    // Fields specific to inspectors
    areaOfInspection: {
        type: String,
        required: function() {
            return this.role === 'inspector';
        },
        default: null
    },
    // Fields specific to sellers
    properties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    // Fields specific to buyers
    savedProperties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt (only if password is modified)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        next();
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to update last login
userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = Date.now();
    await this.save();
};

// Static method to find user by wallet address
userSchema.statics.findByWalletAddress = function(walletAddress) {
    return this.findOne({ walletAddress });
};

// Method to check if user is an inspector
userSchema.methods.isInspector = function() {
    return this.role === 'inspector';
};

// Method to check if user is a seller
userSchema.methods.isSeller = function() {
    return this.role === 'seller';
};

// Method to check if user is a buyer
userSchema.methods.isBuyer = function() {
    return this.role === 'buyer';
};

// Method to check if user is an admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

const User = mongoose.model('User', userSchema);

module.exports = User; 