import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import BackgroundEffects from './backgroundEffects';

function PropertyCardForInspector({ property, onUpdate }) {
    const [inspectionNotes, setInspectionNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleVerify = async (status) => {
        // Log the property ID being used
        console.log(`Attempting to verify/reject property with ID: ${property._id}, Status: ${status}`);
        
        // Check if ID looks potentially invalid (basic check)
        if (!property._id || typeof property._id !== 'string' || property._id.length !== 24) { 
             console.error("Invalid property._id detected before API call:", property._id);
             toast.error("Cannot process request: Invalid property ID.");
             return; // Stop execution
        }

        setIsProcessing(true);
        toast.loading(`Marking property as ${status}...`);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/properties/${property._id}/verify`,
                { status, inspectionNotes }, // Send status and notes
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.dismiss();
            toast.success(`Property marked as ${status} successfully!`);
            onUpdate(property._id); // Notify parent to remove from list
        } catch (error) {
            console.error(`Error updating property status to ${status}:`, error);
            toast.dismiss();
            toast.error(error.response?.data?.message || `Failed to mark property as ${status}.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const formattedPrice = property.price ? property.price.toLocaleString('en-IN') : 'N/A';

    return (
        <div className="bg-white/10 rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row gap-4 p-4">
            <img 
                src={property.image?.url || 'https://via.placeholder.com/200x150?text=No+Image'} 
                alt={property.title} 
                className="w-full md:w-48 h-48 md:h-auto object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-grow flex flex-col">
                <h3 className="text-lg font-semibold font-clash-display mb-1">{property.title || 'Untitled Property'}</h3>
                <p className="text-sm text-gray-400 mb-1"><i className="fas fa-map-marker-alt mr-1"></i> {property.location || 'Unknown Location'}</p>
                <p className="text-sm text-gray-400 mb-1"><i className="fas fa-vector-square mr-1"></i> {property.size || 'N/A'} sq ft</p>
                <p className="text-sm font-semibold text-[#BA6168] mb-2">₹ {formattedPrice}</p>
                <p className="text-xs text-gray-500 mb-2">Owner: {property.owner?.walletAddress || 'N/A'}</p>
                
                {/* Verification Section */}
                <div className="mt-auto pt-3 border-t border-white/20">
                    <label htmlFor={`notes-${property._id}`} className="block text-sm font-medium mb-1 text-gray-300">Inspection Notes:</label>
                    <textarea 
                        id={`notes-${property._id}`}
                        rows="2"
                        value={inspectionNotes}
                        onChange={(e) => setInspectionNotes(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none text-sm mb-2"
                        placeholder="Add verification notes (optional)"
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleVerify('verified')}
                            disabled={isProcessing}
                            className="flex-1 text-center bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? '...' : 'Verify'}
                        </button>
                        <button 
                            onClick={() => handleVerify('rejected')}
                            disabled={isProcessing}
                            className="flex-1 text-center bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? '...' : 'Reject'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LandRegister() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllPendingProperties = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');

            // Redirect if not inspector or not logged in
            if (!token || userData.role !== 'inspector') {
                toast.error("Access denied. Inspectors only.");
                navigate('/');
                return;
            }

            try {
                // Fetch from the new endpoint for ALL pending properties
                const response = await axios.get(
                    'http://localhost:5000/api/properties/pending', 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (Array.isArray(response.data)) {
                    setProperties(response.data);
                } else {
                    console.error("API did not return an array:", response.data);
                    setProperties([]); 
                    setError('Received invalid data format from server.');
                    toast.error('Could not load properties: Invalid data format.');
                }
            } catch (err) {
                console.error("Error fetching pending properties:", err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch properties.');
                toast.error(err.response?.data?.message || 'Could not load pending properties.');
                if (err.response?.status === 401 || err.response?.status === 403) {
                     navigate('/'); // Redirect on auth errors
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllPendingProperties();
    }, [navigate]);

    // Function to remove property from state after verification/rejection
    const handlePropertyUpdate = (propertyId) => {
        setProperties(prev => prev.filter(p => p._id !== propertyId));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-32 px-4 md:px-8 pb-16">
            <BackgroundEffects />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-clash-display font-bold mb-10 text-center">All Properties Pending Verification</h1>
                
                {loading && (
                    <div className="text-center py-10">
                        <p className="text-xl">Loading pending properties...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-10 text-red-400">
                        <p className="text-xl">Error: {error}</p>
                    </div>
                )}

                {!loading && !error && properties.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-500">No properties are currently pending verification.</p>
                    </div>
                )}

                {!loading && !error && properties.length > 0 && (
                    <div className="space-y-6">
                        {properties.map((property) => (
                            <PropertyCardForInspector 
                                key={property._id} 
                                property={property} 
                                onUpdate={handlePropertyUpdate} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LandRegister; 