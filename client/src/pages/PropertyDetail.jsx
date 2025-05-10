import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
// Assuming you have a transferOwnership function in landContract utils
// import { transferOwnership } from '../utils/landContract'; 

function loadRazorpayScript() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

function PropertyDetail() {
    const { id } = useParams(); // Get property ID from URL
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [userData, setUserData] = useState(null);
    const [isPurchasing, setIsPurchasing] = useState(false);

    useEffect(() => {
        // Get user data from localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            const parsedData = JSON.parse(storedUserData);
            setUserData(parsedData);
            setUserRole(parsedData.role);
        }

        // Fetch property details
        const fetchProperty = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:5000/api/properties/${id}`);
                setProperty(response.data);
            } catch (err) {
                console.error("Error fetching property:", err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch property details.');
                toast.error(err.response?.data?.message || 'Could not load property details.');
                if (err.response?.status === 404) {
                    navigate('/listings'); // Redirect if property not found
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id, navigate]);

    const handlePurchase = async () => {
        setIsPurchasing(true);
        toast.loading('Initiating purchase...');

        const razorpayLoaded = await loadRazorpayScript();
        if (!razorpayLoaded) {
            toast.dismiss();
            toast.error('Failed to load payment gateway. Please try again.');
            setIsPurchasing(false);
            return;
        }

        try {
            // 1. Create Order on Backend
            
            // Ensure amount is an integer
            const amountInPaise = Math.round(property.price * 100);
            
            // Generate a shorter receipt (max 40 chars)
            const shortTimestamp = Date.now().toString().slice(-8); // Use last 8 digits of timestamp
            const receiptId = `prop_${property._id}_${shortTimestamp}`.slice(0, 40); // Ensure it's max 40 chars

            console.log("Creating order with Amount:", amountInPaise, "Receipt:", receiptId); // Debug log
            
            const orderResponse = await axios.post('http://localhost:5000/api/payments/create-order', {
                amount: amountInPaise, // Send integer amount
                currency: 'INR',
                receipt: receiptId, // Send shorter receipt
                notes: {
                    propertyId: property._id,
                    propertyName: property.title,
                    buyerWallet: userData.walletAddress
                }
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const { amount, id: order_id, currency } = orderResponse.data.order;
            toast.dismiss();

            // 2. Configure Razorpay Options
            const options = {
                key: 'rzp_test_XDJyRLoZSTmLWa', // Replace with your Key ID
                amount: amount,
                currency: currency,
                name: "Land Ledger Property",
                description: `Purchase of ${property.title}`,
                image: property.image?.url || "/logo.png", // Optional: Add your logo
                order_id: order_id,
                handler: async function (response) {
                    // 3. Handle Payment Success - Verify on Backend
                    toast.loading('Verifying payment...');
                    try {
                        const verificationResponse = await axios.post('http://localhost:5000/api/payments/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            propertyId: property._id // Send property ID for backend logic
                        }, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });

                        if (verificationResponse.data.success) {
                            toast.dismiss();
                            toast.success('Payment Verified! Processing ownership transfer...');
                            
                            // 4. (Optional but Recommended) Trigger Blockchain Transfer 
                            // try {
                            //     const provider = new ethers.providers.Web3Provider(window.ethereum);
                            //     const signer = provider.getSigner();
                            //     const txHash = await transferOwnership(signer, property.landId, userData.walletAddress);
                            //     toast.success(`Blockchain Ownership Transferred! Tx: ${txHash.substring(0,10)}...`);
                            //     
                            //     // Maybe update backend again with txHash?
                            //     // await axios.post(`/api/properties/${property._id}/update-tx`, { transactionHash: txHash }, config);
                            //
                            // } catch (blockchainError) {
                            //     console.error("Blockchain transfer error:", blockchainError);
                            //     toast.error("Payment successful, but blockchain transfer failed. Please contact support.");
                            //     // Need robust handling here - maybe flag property for manual transfer
                            // }

                            // 5. Update property status on backend (if not already done during verification)
                            // The /verify-payment endpoint might already handle this
                            // If not, call the buyProperty endpoint:
                            // await axios.post(`http://localhost:5000/api/properties/${id}/buy`, {}, {
                            //     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            // });

                            toast.success('Property purchased successfully!');
                            navigate('/'); // Navigate to user's profile or owned properties page

                        } else {
                            toast.dismiss();
                            toast.error(verificationResponse.data.message || 'Payment verification failed.');
                        }

                    } catch (verifyError) {
                        console.error("Payment verification error:", verifyError);
                        toast.dismiss();
                        toast.error(verifyError.response?.data?.message || 'Failed to verify payment.');
                    } finally {
                         setIsPurchasing(false);
                    }
                },
                prefill: {
                    // Optional: Prefill user details if available
                    // name: userData?.name || "", 
                    // email: userData?.email || "",
                    // contact: userData?.contact || "" 
                },
                notes: {
                    address: "Land Ledger Transaction"
                },
                theme: {
                    color: "#BA6168" // Match your theme color
                },
                modal: {
                    ondismiss: function() {
                        console.log('Razorpay checkout dismissed');
                        toast.dismiss();
                        toast.error('Payment cancelled.');
                        setIsPurchasing(false);
                    }
                }
            };

            // 3. Open Razorpay Checkout
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Razorpay Payment Failed:", response.error);
                toast.dismiss();
                toast.error(`Payment Failed: ${response.error.description || response.error.reason}`);
                 setIsPurchasing(false);
            });
            rzp.open();

        } catch (err) {
            console.error("Error during purchase initiation:", err);
            toast.dismiss();
            toast.error(err.response?.data?.message || 'Failed to initiate purchase.');
            setIsPurchasing(false);
        } 
    };


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white"><p>Loading property details...</p></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white"><p className="text-red-400">Error: {error}</p></div>;
    }

    if (!property) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white"><p>Property not found.</p></div>;
    }

    // Format price with commas
    const formattedPrice = property.price ? property.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'N/A';


    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-32 px-4 md:px-8 pb-16">
            <div className="max-w-4xl mx-auto bg-white/5 p-8 rounded-xl shadow-xl backdrop-blur-lg">
                {/* Property Image */}
                <div className="mb-6">
                    <img 
                        src={property.image?.url || 'https://via.placeholder.com/800x400?text=No+Image'} 
                        alt={property.title} 
                        className="w-full h-auto max-h-[400px] object-cover rounded-lg shadow-md"
                    />
                </div>

                {/* Property Title & Price */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                    <h1 className="text-3xl font-clash-display font-bold mb-2 md:mb-0">{property.title}</h1>
                    <p className="text-3xl font-semibold text-[#BA6168] whitespace-nowrap">{formattedPrice}</p>
                </div>

                {/* Location & Area */}
                <div className="flex flex-wrap text-gray-400 text-sm mb-6 border-b border-white/10 pb-4">
                    <span className="mr-4 mb-1"><i className="fas fa-map-marker-alt mr-1"></i> {property.location}</span>
                    <span className="mr-4 mb-1"><i className="fas fa-vector-square mr-1"></i> {property.area} sq ft</span>
                     <span className="mr-4 mb-1"><i className="fas fa-building mr-1"></i> {property.propertyType?.charAt(0).toUpperCase() + property.propertyType?.slice(1) || 'N/A'}</span>
                    <span className="mr-4 mb-1"><i className="fas fa-tag mr-1"></i> Status: <span className={`font-medium ${property.status === 'sold' ? 'text-red-400' : 'text-green-400'}`}>{property.status?.charAt(0).toUpperCase() + property.status?.slice(1) || 'N/A'}</span></span>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <p className="text-gray-300 leading-relaxed">{property.description}</p>
                </div>

                {/* Owner Info */}
                <div className="mb-6 bg-white/10 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Owner Information</h2>
                    <p className="text-sm text-gray-400">Wallet Address:</p>
                    <p className="font-mono text-sm break-all">{property.ownerWalletAddress || 'N/A'}</p>
                </div>
                
                 {/* Blockchain Info */}
                <div className="mb-6 bg-white/10 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Blockchain Details</h2>
                    <p className="text-sm text-gray-400">Land ID:</p>
                    <p className="font-mono text-sm break-all">{property.landId || 'N/A'}</p>
                    <p className="text-sm text-gray-400 mt-2">Transaction Hash:</p>
                    <p className="font-mono text-sm break-all">{property.transactionHash || 'N/A'}</p>
                    {/* Add Link to Etherscan/Polygonscan if desired */}
                </div>


                {/* Purchase Button (Conditional) */}
                {userRole === 'buyer' && property.status !== 'sold' && property.status !== 'pending' && (
                     <div className="mt-8 text-center">
                        <button 
                             onClick={handlePurchase}
                             disabled={isPurchasing}
                             className="bg-[#BA6168] text-white px-10 py-3 rounded-3xl font-bold text-lg hover:bg-[#a54f56] transition ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             {isPurchasing ? 'Processing...' : 'Purchase Property'}
                         </button>
                     </div>
                 )}
                 
                 {userRole === 'buyer' && property.status === 'sold' && (
                     <div className="mt-8 text-center text-gray-500 font-medium">
                         This property has already been sold.
                     </div>
                 )}

                 {/* Add other relevant sections if needed - e.g., Inspector Info */}

            </div>
        </div>
    );
}

export default PropertyDetail; 