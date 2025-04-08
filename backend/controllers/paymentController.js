const Razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private (Seller Only)
const createOrder = async (req, res) => {
    try {
        let { amount, currency, receipt, notes } = req.body;

        // Basic validation
        if (!amount || !currency || !receipt || !notes || !notes.propertyId) {
            return res.status(400).json({ message: 'Missing required fields for order creation' });
        }

        // Ensure amount is an integer (Backend Safeguard)
        const integerAmount = parseInt(amount, 10);
        if (isNaN(integerAmount) || integerAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount specified.' });
        }
        
        // Ensure receipt length (Backend Safeguard)
        if (receipt.length > 40) {
            console.warn('Receipt too long, truncating:', receipt);
            receipt = receipt.slice(0, 40);
        }

        const options = {
            amount: integerAmount, // Use validated integer amount
            currency,
            receipt,
            notes
        };

        const order = await Razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ message: 'Razorpay order creation failed' });
        }

        console.log('Razorpay Order Created:', order);
        res.status(201).json({ order });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to create Razorpay order' 
        });
    }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify-payment
// @access  Private (Seller Only)
const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            propertyId
        } = req.body;
        
        const buyerUserId = req.user._id; // Assuming protect middleware adds user to req
        const buyerWalletAddress = req.user.walletAddress; // Assuming user has walletAddress

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !propertyId) {
            return res.status(400).json({ success: false, message: 'Missing payment verification details' });
        }

        // Construct the verification string
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        // Generate the expected signature using your Razorpay Key Secret
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Compare signatures
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment is authentic - Update database
            console.log('Payment Verification Successful for Order:', razorpay_order_id);
            
            // Find the property
            const property = await Property.findById(propertyId);
            if (!property) {
                // This shouldn't happen if the order was created correctly, but check anyway
                console.error(`Verification successful but property ${propertyId} not found.`);
                return res.status(404).json({ success: false, message: 'Property not found after payment.' });
            }

            if (property.status === 'sold') {
                 console.warn(`Property ${propertyId} is already marked as sold.`);
                 // Still return success as payment was valid, but maybe notify user
                 return res.json({ success: true, message: 'Payment successful, property was already sold.' });
            }

            // Update property status and owner details
            property.status = 'sold';
            const previousOwner = property.owner;
            property.owner = buyerUserId; // Update owner to the buyer's User ID
            property.ownerWalletAddress = buyerWalletAddress; // Update owner wallet
            // Optionally store payment details
            property.paymentDetails = {
                 razorpay_order_id,
                 razorpay_payment_id,
                 verifiedAt: new Date()
            };
            
            await property.save();
            console.log(`Property ${propertyId} marked as sold to user ${buyerUserId}`);

            // Optionally: Update previous owner's records if needed
            // Optionally: Trigger notification to previous owner/buyer

            // Respond success to frontend
            res.json({ success: true, message: 'Payment verified and property updated.' });

        } else {
            // Payment verification failed
            console.error('Payment Verification Failed for Order:', razorpay_order_id);
            res.status(400).json({ success: false, message: 'Invalid payment signature.' });
        }

    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Failed to verify payment' 
        });
    }
};


module.exports = {
    createOrder,
    verifyPayment
}; 