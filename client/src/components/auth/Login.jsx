import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import BackgroundEffects from '../backgroundEffects';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        role: '',
        walletAddress: location.state?.walletAddress || '',
        areaOfInspection: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
    const [connectingWallet, setConnectingWallet] = useState(false);
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    const [isNewUser, setIsNewUser] = useState(location.state?.isNewUser || false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        // Check if MetaMask is installed
        setIsMetaMaskInstalled(!!window.ethereum);
    }, []);

    useEffect(() => {
        if (formData.walletAddress) {
            checkExistingUser();
        }
    }, [formData.walletAddress]);

    const checkExistingUser = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/wallet/${formData.walletAddress}`);
            if (response.data) {
                // User exists, log them in
                handleLogin();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setIsNewUser(true);
            }
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                setError('Please install MetaMask to connect your wallet');
                return;
            }
            setConnectingWallet(true);
            setError('');
            setShowRoleSelection(false);

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected their wallet
                    setWalletConnected(false);
                    setFormData(prev => ({ ...prev, walletAddress: '', role: '' }));
                    setShowRoleSelection(false);
                } else {
                    // User switched accounts
                    setFormData(prev => ({ ...prev, walletAddress: accounts[0] }));
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
            
            setFormData(prev => ({
                ...prev,
                walletAddress
            }));
            setWalletConnected(true);
        } catch (error) {
            setError('Failed to connect wallet: ' + error.message);
            setWalletConnected(false);
            setShowRoleSelection(false);
        } finally {
            setConnectingWallet(false);
        }
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.post('http://localhost:5000/api/users/login', {
                walletAddress: formData.walletAddress,
                role: formData.role
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify({
                id: response.data._id,
                role: response.data.role,
                walletAddress: response.data.walletAddress
            }));

            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error("Image size should be less than 10MB");
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.role) {
                setError('Please select a role');
                setLoading(false);
                return;
            }

            // Create FormData instance
            const formDataToSend = new FormData();
            console.log("he", formData.walletAddress);
            
            // Append all form fields
            formDataToSend.append('walletAddress', formData.walletAddress );
            formDataToSend.append('role', formData.role );
            
            // Only append areaOfInspection if it exists and role is inspector
            if (formData.role === 'inspector' && formData.areaOfInspection) {
                formDataToSend.append('areaOfInspection', formData.areaOfInspection);
            }

            // Append image if selected
            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            // Log the FormData contents for debugging
            console.log('FormData contents:');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`${key}:`, value);
            }

            // Get the token from localStorage
            const token = localStorage.getItem('token');

            const response = await axios.post('http://localhost:5000/api/users/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': token ? `Bearer ${token}` : undefined
                }
            });

            if (!response.data) {
                throw new Error('No response data received');
            }
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify({
                id: response.data._id,
                role: response.data.role,
                walletAddress: response.data.walletAddress,
                areaOfInspection: response.data.areaOfInspection,
                profileImage: response.data.profileImage
            }));

            navigate('/');
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response:', error.response.data);
                setError(error.response.data.message || 'Registration failed. Please try again.');
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
                setError('No response from server. Please try again.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-4">
            <BackgroundEffects />
            <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-[#BA6168]/30 shadow-lg shadow-[#BA6168]/20">
                <h2 className="font-clash-display text-3xl font-bold text-center mb-6">
                    {isNewUser ? 'Complete Registration' : 'Login'}
                </h2>
                
                {error && (
                    <div className="mb-6 p-4 bg-[#BA6168]/10 border border-[#BA6168]/30 rounded-lg text-[#BA6168] font-inter text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block font-inter font-light mb-2">Wallet Address</label>
                        <input
                            type="text"
                            value={formData.walletAddress}
                            readOnly
                            className="w-full p-3 bg-white/10 border border-[#BA6168]/30 rounded-lg text-white font-inter"
                        />
                    </div>

                    {isNewUser && (
                        <>
                            <div>
                                <label className="block font-inter font-light mb-2">Select Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 bg-black border border-[#BA6168]/30 rounded-lg text-white font-inter focus:outline-none focus:border-[#BA6168] focus:ring-2 focus:ring-[#BA6168]/20"
                                >
                                    <option value="" className="bg-black text-white">Select a role</option>
                                    <option value="buyer" className="bg-black text-white">Buyer</option>
                                    <option value="seller" className="bg-black text-white">Seller</option>
                                    <option value="inspector" className="bg-black text-white">Inspector</option>
                                </select>
                            </div>

                            {formData.role === 'inspector' && (
                                <div>
                                    <label className="block font-inter font-light mb-2">Area of Inspection</label>
                                    <input
                                        type="text"
                                        name="areaOfInspection"
                                        value={formData.areaOfInspection}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your area of inspection"
                                        className="w-full p-3 bg-white/10 border border-[#BA6168]/30 rounded-lg text-white font-inter focus:outline-none focus:border-[#BA6168] focus:ring-2 focus:ring-[#BA6168]/20"
                                    />
                                </div>
                            )}

                            {/* Profile Image Upload */}
                            <div>
                                <label className="block font-inter font-light mb-2">Profile Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-lg">
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? (
                                            <div className="mb-4">
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile preview"
                                                    className="mx-auto h-32 w-32 rounded-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                        <div className="flex text-sm text-gray-400">
                                            <label
                                                htmlFor="profile-image-upload"
                                                className="relative cursor-pointer bg-white/5 rounded-md font-medium text-white hover:text-[#BA6168] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#BA6168]"
                                            >
                                                <span>Upload a file</span>
                                                <input
                                                    id="profile-image-upload"
                                                    name="profile-image-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (isNewUser && !formData.role) || (isNewUser && formData.role === 'inspector' && !formData.areaOfInspection)}
                        className="w-full py-3 bg-transparent border border-[#BA6168] text-white rounded-lg font-inter font-medium hover:bg-[#BA6168] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (isNewUser ? 'Complete Registration' : 'Login')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login; 