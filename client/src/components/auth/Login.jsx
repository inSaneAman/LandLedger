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

            const response = await axios.post('http://localhost:5000/api/users/register', {
                walletAddress: formData.walletAddress,
                role: formData.role,
                areaOfInspection: formData.areaOfInspection
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify({
                id: response.data._id,
                role: response.data.role,
                walletAddress: response.data.walletAddress,
                areaOfInspection: response.data.areaOfInspection
            }));

            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
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
                                    className="w-full p-3 bg-white/10 border border-[#BA6168]/30 rounded-lg text-white font-inter focus:outline-none focus:border-[#BA6168] focus:ring-2 focus:ring-[#BA6168]/20"
                                >
                                    <option value="">Select a role</option>
                                    <option value="buyer">Buyer</option>
                                    <option value="seller">Seller</option>
                                    <option value="inspector">Inspector</option>
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