import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackgroundEffects from '../backgroundEffects';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        role: '',
        walletAddress: '',
        areaOfInspection: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
    const [connectingWallet, setConnectingWallet] = useState(false);
    const [showRoleSelection, setShowRoleSelection] = useState(false);

    useEffect(() => {
        // Check if MetaMask is installed
        setIsMetaMaskInstalled(!!window.ethereum);
    }, []);

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

            // Try to login with current wallet address
            const response = await axios.post('http://localhost:5000/api/users/login', {
                walletAddress: formData.walletAddress,
                role: formData.role
            });
            
            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify({
                id: response.data._id,
                role: response.data.role,
                walletAddress: response.data.walletAddress
            }));

            // Redirect to home page
            navigate('/');
        } catch (error) {
            if (error.response?.status === 404) {
                // User not found, show role selection
                setShowRoleSelection(true);
            } else {
                setError(error.response?.data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.role) {
                setError('Please select a role');
                setLoading(false);
                return;
            }

            // Register new user using the register endpoint
            const response = await axios.post('http://localhost:5000/api/users/register', {
                walletAddress: formData.walletAddress,
                role: formData.role,
                areaOfInspection: formData.areaOfInspection
            });
            
            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify({
                id: response.data._id,
                role: response.data.role,
                walletAddress: response.data.walletAddress,
                areaOfInspection: response.data.areaOfInspection
            }));

            // Redirect to home page
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
                    {showRoleSelection ? 'Complete Registration' : 'Connect Wallet'}
                </h2>
                
                {error && (
                    <div className="mb-6 p-4 bg-[#BA6168]/10 border border-[#BA6168]/30 rounded-lg text-[#BA6168] font-inter text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    {showRoleSelection && (
                        <>
                            <div>
                                <label className="block font-inter font-light mb-2">Select Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading || connectingWallet}
                                    className="w-full p-3 bg-white/10 border border-[#BA6168]/30 rounded-lg text-white font-inter focus:outline-none focus:border-[#BA6168] focus:ring-2 focus:ring-[#BA6168]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select a role</option>
                                    <option value="buyer">Buyer</option>
                                    <option value="seller">Seller</option>
                                    <option value="inspector">Inspector</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {formData.role === 'inspector' && (
                                <div>
                                    <label className="block font-inter font-light mb-2">Area of Inspection</label>
                                    <select
                                        name="areaOfInspection"
                                        value={formData.areaOfInspection}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading || connectingWallet}
                                        className="w-full p-3 bg-white/10 border border-[#BA6168]/30 rounded-lg text-white font-inter focus:outline-none focus:border-[#BA6168] focus:ring-2 focus:ring-[#BA6168]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select area of inspection</option>
                                        <option value="residential">Residential</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="industrial">Industrial</option>
                                        <option value="agricultural">Agricultural</option>
                                        <option value="mixed">Mixed Use</option>
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <label className="block font-inter font-light mb-2">Wallet Address</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                name="walletAddress"
                                value={formData.walletAddress}
                                readOnly
                                placeholder="Connect your wallet"
                                required
                                className="flex-1 p-3 bg-white/10 border border-[#BA6168]/30 rounded-lg text-white font-inter focus:outline-none focus:border-[#BA6168] focus:ring-2 focus:ring-[#BA6168]/20"
                            />
                            <button
                                type="button"
                                onClick={connectWallet}
                                disabled={loading || walletConnected || !isMetaMaskInstalled || connectingWallet}
                                className={`px-6 py-3 rounded-lg font-inter font-medium transition-all duration-300
                                    ${walletConnected 
                                        ? 'bg-[#BA6168] border border-[#BA6168] text-white' 
                                        : 'bg-transparent border border-[#BA6168] text-white hover:bg-[#BA6168] disabled:opacity-50 disabled:cursor-not-allowed'}`}
                            >
                                {!isMetaMaskInstalled ? 'Install MetaMask' : 
                                 connectingWallet ? 'Connecting...' :
                                 walletConnected ? 'Connected' : 'Connect Wallet'}
                            </button>
                        </div>
                        {walletConnected && (
                            <div className="mt-2 text-sm text-[#BA6168] font-inter">
                                Connected: {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
                            </div>
                        )}
                    </div>

                    {walletConnected && !showRoleSelection && (
                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={loading || connectingWallet}
                            className="w-full py-3 bg-transparent border border-[#BA6168] text-white rounded-lg font-inter font-medium hover:bg-[#BA6168] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Login'}
                        </button>
                    )}

                    {showRoleSelection && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !formData.role || (formData.role === 'inspector' && !formData.areaOfInspection) || connectingWallet}
                            className="w-full py-3 bg-transparent border border-[#BA6168] text-white rounded-lg font-inter font-medium hover:bg-[#BA6168] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Complete Registration'}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login; 