import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredWalletAddress, connectWallet } from "../utils/web3";
import { addLand } from "../utils/landContract";
import { testContractConnection, testAddLand } from "../utils/testContract";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import axios from "axios";

function AddProperty() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    landName: "",
    landId: "",
    location: "",
    area: "",
    ownerName: "",
    documentHash: "",
    price: "",
    description: ""
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create a preview URL for the image
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
    
    // Validate form
    if (!formData.landName || !formData.landId || !formData.location || !formData.area || 
        !formData.documentHash || !formData.price || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!selectedImage) {
      toast.error("Please upload a property image");
      return;
    }

    try {
      setIsSubmitting(true);

      // First, ensure wallet is connected
      const walletAddress = await connectWallet();
      if (!walletAddress) {
        toast.error("Please connect your wallet to proceed");
        setIsSubmitting(false);
        return;
      }

      // Create FormData for image upload
      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedImage);
      formDataToSend.append('landName', formData.landName);
      formDataToSend.append('title', formData.landId);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('size', formData.area);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('ownerWalletAddress', walletAddress);
      formDataToSend.append('documents', JSON.stringify([{
        name: 'Document Hash',
        url: formData.documentHash
      }]));
      

      // Upload to backend
      const response = await axios.post('http://localhost:5000/api/properties', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
console.log(response)
      // Get the signer from the connected wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Convert ETH price to Wei
      const priceInWei = ethers.utils.parseEther(formData.price);
      
      // Add land to blockchain with price in Wei
      const txHash = await addLand(signer, {
        ...formData,
        ownerName: walletAddress,
        price: priceInWei.toString()
      });
      
      toast.success("Property added successfully!");
      navigate("/listings");
    } catch (error) {
      console.error("Error adding property:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add property. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestContract = async () => {
    try {
      setIsTesting(true);
      
      // Test contract connection
      const isConnected = await testContractConnection();
      if (!isConnected) {
        toast.error("Failed to connect to the contract");
        return;
      }
      
      // Get the signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Test adding a land
      const landDetails = await testAddLand(signer);
      if (landDetails) {
        toast.success("Contract integration test successful!");
      }
    } catch (error) {
      console.error("Error testing contract:", error);
      toast.error("Failed to test contract integration");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-32 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-clash-display font-bold mb-8 text-center">Add New Property</h1>
        
        <div className="flex justify-end mb-4">
          <button
            onClick={handleTestContract}
            disabled={isTesting}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? "Testing..." : "Test Contract Integration"}
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/10 p-8 rounded-xl backdrop-blur-xl">
          <div>
            <label className="block text-sm font-medium mb-2">Land Name</label>
            <input
              type="text"
              name="landName"
              value={formData.landName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter land name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Land ID</label>
            <input
              type="text"
              name="landId"
              value={formData.landId}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter land ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Area (in sq ft)</label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter area"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Document Hash</label>
            <input
              type="text"
              name="documentHash"
              value={formData.documentHash}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter document hash"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Price (in ETH)</label>
            <div className="relative">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.000000000000000001"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
                placeholder="Enter price"
              />
              <div className="absolute right-2 top-2 text-sm text-gray-400">
                ETH
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Will be converted to Wei automatically
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-[#BA6168] focus:outline-none"
              placeholder="Enter property description"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Property Image</label>
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
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white/5 rounded-md font-medium text-white hover:text-[#BA6168] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#BA6168]"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
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