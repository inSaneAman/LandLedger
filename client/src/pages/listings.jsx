import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function PropertyCard({ property }) {
    // Format price with commas
    const formattedPrice = property.price ? property.price.toLocaleString('en-IN') : 'N/A';

    return (
        <div className="bg-white/10 rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 flex flex-col">
            <img 
                src={property.image?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                alt={property.title} 
                className="w-full h-48 object-cover"
            />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold font-clash-display mb-2 truncate">{property.title || 'Untitled Property'}</h3>
                <p className="text-sm text-gray-400 mb-1"><i className="fas fa-map-marker-alt mr-1"></i> {property.location || 'Unknown Location'}</p>
                <p className="text-sm text-gray-400 mb-1"><i className="fas fa-vector-square mr-1"></i> {property.area || 'N/A'} sq ft</p>
                <p className="text-lg font-semibold text-[#BA6168] mb-3">₹ {formattedPrice}</p>
                
                <div className="mt-auto pt-3 border-t border-white/10">
                    <Link 
                        to={`/property/${property._id}`} 
                        className="block w-full text-center bg-[#BA6168] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a54f56] transition ease-in-out duration-300 text-sm"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Listings({ isEmbedded = false }) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:5000/api/properties');
                if (Array.isArray(response.data)) {
                    setProperties(response.data);
                } else {
                    console.error("API did not return an array:", response.data);
                    setProperties([]);
                    setError('Received invalid data format from server.');
                    if (!isEmbedded) {
                        toast.error('Could not load properties: Invalid data format.');
                    }
                }
            } catch (err) {
                console.error("Error fetching properties:", err);
                setError(err.message || 'Failed to fetch properties.');
                if (!isEmbedded) {
                    toast.error(err.response?.data?.message || 'Could not load properties.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [isEmbedded]);

    const content = (
        <>
            {loading && (
                <div className="text-center py-10">
                    <p className="text-xl">Loading properties...</p>
                </div>
            )}

            {error && (
                <div className="text-center py-10 text-red-400">
                    <p className="text-xl">Error loading properties: {error}</p>
                </div>
            )}

            {!loading && !error && properties.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-xl text-gray-500">No properties found.</p>
                </div>
            )}

            {!loading && !error && properties.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map((property) => (
                        <PropertyCard key={property._id} property={property} />
                    ))}
                </div>
            )}
        </>
    );

    if (!isEmbedded) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-32 px-4 md:px-8 pb-16">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-clash-display font-bold mb-10 text-center">Property Listings</h1>
                    {content}
                </div>
            </div>
        );
    }

    return content;
}

export default Listings;
