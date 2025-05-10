import { ethers } from 'ethers';
import { getLandContract, addLand, getLandDetails } from './landContract';
import toast from 'react-hot-toast';

export const testContractConnection = async () => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      toast.error('MetaMask is not installed');
      return false;
    }

    // Create a provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get the contract
    const contract = getLandContract(provider);
    
    // Try to call a simple view function to test the connection
    const network = await provider.getNetwork();
    
    toast.success(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    return true;
  } catch (error) {
    console.error('Error testing contract connection:', error);
    toast.error('Failed to connect to the contract');
    return false;
  }
};

export const testAddLand = async (signer) => {
  try {
    // Generate a random land ID
    const landId = `TEST${Math.floor(Math.random() * 10000)}`;
    
    // Test data
    const landData = {
      landId,
      location: 'Test Location',
      area: '1000',
      ownerName: 'Test Owner',
      documentHash: 'QmTestHash',
      price: '1.0'
    };
    
    // Add the land
    const txHash = await addLand(signer, landData);
    
    // Get the land details
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const details = await getLandDetails(provider, landId);
    
    toast.success(`Test land added successfully! Land ID: ${landId}`);
    return details;
  } catch (error) {
    console.error('Error testing add land:', error);
    toast.error('Failed to add test land');
    return null;
  }
}; 