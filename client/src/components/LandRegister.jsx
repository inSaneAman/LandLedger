import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import BackgroundEffects from './backgroundEffects';

const LandRegister = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignedProperties = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || userData.role !== 'inspector') {
          toast.error('Unauthorized access');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/properties/inspector/${userData.walletAddress}`);
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to fetch assigned properties');
        toast.error('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedProperties();
  }, []);

  const handleInspectionStatus = async (propertyId, status) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.walletAddress) {
        toast.error('Please reconnect your wallet');
        return;
      }

      const response = await axios.put(`http://localhost:5000/api/properties/${propertyId}/inspection-status`, {
        status,
        inspectedAt: new Date(),
        inspectorWallet: userData.walletAddress
      });
      
      // Update the local state with the response data
      setProperties(properties.map(property => 
        property._id === propertyId 
          ? response.data
          : property
      ));
      
      toast.success(`Property ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating inspection status:', error);
      toast.error(error.response?.data?.message || 'Failed to update inspection status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading assigned properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl text-[#BA6168]">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <BackgroundEffects />
      <div className="max-w-7xl mx-auto">
        <h1 className="font-clash-display text-4xl font-bold mb-8">Land Register</h1>
        
        {properties.filter(property => property.status === 'pending').length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No pending properties for inspection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties
              .filter(property => property.status === 'pending')
              .map((property) => (
                <div 
                  key={property._id}
                  className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-[#BA6168]/30 hover:border-[#BA6168] transition-all duration-300"
                >
                  {property.image && property.image.url && (
                    <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={property.image.url} 
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h2 className="font-clash-display text-2xl font-bold mb-4">{property.title}</h2>
                  <div className="space-y-3 mb-6">
                    <p className="text-gray-300">
                      <span className="font-medium">Land Name:</span> {property.landName}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Description:</span> {property.description}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Location:</span> {property.location}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Area:</span> {property.size} sq ft
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Price:</span> {property.price} ETH
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Owner Address:</span>{' '}
                      <span className="font-mono text-sm">
                        {typeof property.ownerWalletAddress === 'string' 
                          ? `${property.ownerWalletAddress.slice(0, 6)}...${property.ownerWalletAddress.slice(-4)}`
                          : 'N/A'}
                      </span>
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Documents:</span>{' '}
                      {property.documents && property.documents.length > 0 ? (
                        <span className="text-[#BA6168]">{property.documents.length} document(s) attached</span>
                      ) : (
                        <span className="text-gray-500">No documents</span>
                      )}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(property.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Status:</span>{' '}
                      <span className="px-2 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-500">
                        Pending
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleInspectionStatus(property._id, 'verified')}
                      className="flex-1 bg-green-500/20 text-green-500 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all duration-300"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleInspectionStatus(property._id, 'rejected')}
                      className="flex-1 bg-red-500/20 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandRegister; 