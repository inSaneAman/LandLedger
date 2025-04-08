import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { ethers } from "ethers";
import { addLand } from "../utils/landContract";

function AddProperty() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    area: "",
    price: "",
    propertyType: "residential", // residential, commercial, agricultural
  });

  useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { role } = JSON.parse(userData);
      setUserRole(role);
    } else {
      // If no user data, redirect to home
      navigate('/');
      toast.error("Please connect your wallet first");
    }
  }, [navigate]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Validate form
      if (!formData.title || !formData.description || !formData.location || 
          !formData.area || !formData.price || !selectedImage) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Get wallet address
      const userData = JSON.parse(localStorage.getItem('userData'));
      const walletAddress = userData?.walletAddress;
      
      if (!walletAddress) {
        toast.error("Please connect your wallet");
        return;
      }

      // Get ethereum provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create FormData for submission
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('propertyType', formData.propertyType);
      formDataToSend.append('image', selectedImage);
      formDataToSend.append('ownerWalletAddress', walletAddress);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required");
        navigate('/auth');
        return;
      }

      // First add to blockchain
      try {
        // Generate a unique landId
        const landId = `LAND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const blockchainData = {
          landId: landId,
          location: formData.location,
          area: formData.area,
          ownerName: formData.title, // Using title as owner name since we don't have a separate field
          documentHash: "QmHash" + Date.now(), // Placeholder document hash
          price: formData.price // Make sure price is included
        };

        // Log the data being sent to blockchain for debugging
        console.log("Sending to blockchain:", blockchainData);

        const txHash = await addLand(signer, blockchainData);
        
        // Add blockchain data to form data
        formDataToSend.append('landId', landId);
        formDataToSend.append('transactionHash', txHash);
        
        toast.success("Property added to blockchain!");
      } catch (error) {
        console.error("Blockchain error:", error);
        toast.error("Failed to add property to blockchain: " + (error.message || error));
        return;
      }

      // Then submit to backend
      const response = await axios.post(
        'http://localhost:5000/api/properties',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success("Property added successfully!");
      navigate("/listings");
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error(error.response?.data?.message || "Failed to add property");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-32 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-clash-display font-bold mb-8 text-center">
          {userRole === 'seller' ? 'List Your Property' : 'Add New Property'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/10 p-8 rounded-xl backdrop-blur-xl">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Property Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter property title"
              required
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Property Type*</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              required
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="agricultural">Agricultural</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location*</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter property location"
              required
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium mb-2">Area (in sq ft)*</label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter area in square feet"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price (in INR)*</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter price in INR"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter property description"
              required
            />
          </div>

          {/* Property Image */}
          <div>
            <label className="block text-sm font-medium mb-2">Property Image*</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Property preview"
                      className="mx-auto h-48 w-auto rounded-lg"
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
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white/5 rounded-md font-medium text-white hover:text-[#BA6168] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#BA6168]"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
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

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#BA6168] text-white px-8 py-3 rounded-3xl font-medium hover:bg-[#a54f56] transition ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding Property..." : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProperty; 