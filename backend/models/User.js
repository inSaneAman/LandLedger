const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'inspector', 'admin'],
        required: true
    },
    // Fields specific to inspectors
    areaOfInspection: {
        type: String,
        required: function() {
            return this.role === 'inspector';
        },
        default: null
    },
    assignedProperties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
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