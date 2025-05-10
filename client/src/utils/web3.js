import { ethers } from 'ethers';

export const connectWallet = async () => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to use this feature');
    }

    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    // Create a Web3Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get the signer
    const signer = provider.getSigner();
    
    // Get the network
    const network = await provider.getNetwork();

    // Store wallet address in localStorage
    localStorage.setItem('walletAddress', accounts[0]);
    
    return {
      address: accounts[0],
      signer,
      provider,
      network
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const getStoredWalletAddress = () => {
  return localStorage.getItem('walletAddress');
};

export const setupWalletListeners = (onAccountsChanged, onChainChanged) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        localStorage.removeItem('walletAddress');
        onAccountsChanged(null);
      } else {
        // User switched accounts
        localStorage.setItem('walletAddress', accounts[0]);
        onAccountsChanged(accounts[0]);
      }
    });

    window.ethereum.on('chainChanged', () => {
      // Reload the page on chain change as recommended by MetaMask
      window.location.reload();
    });
  }
};

export const disconnectWallet = () => {
  localStorage.removeItem('walletAddress');
}; 