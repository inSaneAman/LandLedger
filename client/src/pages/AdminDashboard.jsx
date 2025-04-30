import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaCheck, FaTimes as FaCross } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is admin
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.role !== 'admin') {
            toast.error('Access denied. Admin only.');
            navigate('/');
            return;
        }

        const fetchUsers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get("http://localhost:5000/api/users/allusers", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Filter out admin users
                const nonAdminUsers = response.data.users.filter(user => user.role !== 'admin');
                setUsers(nonAdminUsers);
                setError(null);
            } catch (err) {
                setError('Failed to fetch users. Please try again later.');
                console.error('Error fetching users:', err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

    const handleVerificationToggle = async (walletAddress, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/users/verification`, {
                isVerified: !currentStatus,
                walletAddress: walletAddress
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update the users list with the new verification status
            setUsers(users.map(user => 
                user.walletAddress === walletAddress 
                    ? { ...user, isVerified: !currentStatus }
                    : user
            ));
            
            // Update the selected user if modal is open
            if (selectedUser && selectedUser.walletAddress === walletAddress) {
                setSelectedUser({ ...selectedUser, isVerified: !currentStatus });
            }

            toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update verification status');
            console.error('Error updating verification status:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/');
            }
        }
    };

    const handleImageClick = (imageUrl, user) => {
        setSelectedImage(imageUrl);
        setSelectedUser(user);
    };

    const closeModal = () => {
        setSelectedImage(null);
        setSelectedUser(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BA6168]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-clash-display font-bold mb-2">
                    Admin <span className="text-[#BA6168]">Dashboard</span>
                </h1>
                <p className="text-gray-400 mb-8">Manage user verifications</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white/10 rounded-xl p-6">
                    <div className="overflow-x-auto rounded-lg border border-white/10">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                        Aadhar Card
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                        Wallet Address
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition duration-300">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleImageClick(user.image?.url, user)}
                                                className="w-12 h-12 rounded overflow-hidden bg-white/10 hover:opacity-80 transition duration-300"
                                            >
                                                <img
                                                    src={user.image?.url || 'https://via.placeholder.com/48?text=No+Image'}
                                                    alt="Aadhar Card"
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-white">
                                            {user.walletAddress}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                                user.role === 'seller' ? 'bg-blue-500/20 text-blue-400' :
                                                user.role === 'inspector' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-green-500/20 text-green-400'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                user.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {user.isVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Image Modal with Verification Controls */}
            {selectedImage && selectedUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="relative bg-white/10 rounded-xl p-4 backdrop-blur-xl" style={{ width: '400px' }}>
                        <button
                            onClick={closeModal}
                            className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
                        >
                            <FaTimes className="text-sm" />
                        </button>
                        <div className="space-y-4">
                            <img
                                src={selectedImage}
                                alt="Aadhar Card Large View"
                                className="w-full h-auto rounded-lg object-contain"
                                style={{ maxHeight: '400px' }}
                            />
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => handleVerificationToggle(selectedUser.walletAddress, selectedUser.isVerified)}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition duration-300 ${
                                        selectedUser.isVerified
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    }`}
                                >
                                    {selectedUser.isVerified ? (
                                        <>
                                            <FaCross className="text-sm" />
                                            Unverify User
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck className="text-sm" />
                                            Verify User
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard; 