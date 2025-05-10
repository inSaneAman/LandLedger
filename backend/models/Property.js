const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ownerWalletAddress: {
        type: String,
        required: [true, 'Owner wallet address is required'],
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
    },
    area: {
        type: Number,
        required: [true, 'Please add an area'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    propertyType: {
        type: String,
        enum: ['residential', 'commercial', 'agricultural'],
        required: [true, 'Please specify property type'],
    },
    image: {
        url: String,
        publicId: String,
    },
    landId: {
        type: String,
        required: [true, 'Blockchain Land ID is required'],
        unique: true,
    },
    transactionHash: {
        type: String,
        required: [true, 'Blockchain transaction hash is required'],
        unique: true,
    },
    inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'sold'],
        default: 'pending',
    },
    verifiedByInspector: {
        type: Boolean,
        default: false,
    },
    verificationDate: {
        type: Date,
    },
    inspectionNotes: {
        type: String,
    },
    isListed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Property', propertySchema); 