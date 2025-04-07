import { ethers } from 'ethers';

// Get contract address from environment variable or use a default for local testing
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Contract ABI - this should match your deployed contract
const CONTRACT_ABI = [
  "function addLand(string memory _landId, string memory _location, uint256 _area, string memory _ownerName, string memory _documentHash, uint256 _price) public",
  "function updateLand(string memory _landId, string memory _location, uint256 _area, string memory _ownerName, string memory _documentHash) public",
  "function listLand(string memory _landId, uint256 _price) public",
  "function unlistLand(string memory _landId) public",
  "function getLandDetails(string memory _landId) public view returns (string memory landId, string memory location, uint256 area, string memory ownerName, string memory documentHash, uint256 price, bool isListed, address owner, uint256 timestamp)",
  "function getOwnerLands(address _owner) public view returns (string[] memory)",
  "function getListedLands() public view returns (string[] memory)"
];

export const getLandContract = (provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

export const addLand = async (signer, landData) => {
  try {
    const contract = getLandContract(signer);
    const tx = await contract.addLand(
      landData.landId,
      landData.location,
      ethers.utils.parseUnits(landData.area.toString(), 'ether'),
      landData.ownerName,
      landData.documentHash,
      ethers.utils.parseUnits(landData.price.toString(), 'ether')
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error adding land:', error);
    throw error;
  }
};

export const updateLand = async (signer, landData) => {
  try {
    const contract = getLandContract(signer);
    const tx = await contract.updateLand(
      landData.landId,
      landData.location,
      ethers.utils.parseUnits(landData.area.toString(), 'ether'),
      landData.ownerName,
      landData.documentHash
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error updating land:', error);
    throw error;
  }
};

export const listLand = async (signer, landId, price) => {
  try {
    const contract = getLandContract(signer);
    const tx = await contract.listLand(
      landId,
      ethers.utils.parseUnits(price.toString(), 'ether')
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error listing land:', error);
    throw error;
  }
};

export const unlistLand = async (signer, landId) => {
  try {
    const contract = getLandContract(signer);
    const tx = await contract.unlistLand(landId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error unlisting land:', error);
    throw error;
  }
};

export const getLandDetails = async (provider, landId) => {
  try {
    const contract = getLandContract(provider);
    const landDetails = await contract.getLandDetails(landId);
    return {
      landId: landDetails.landId,
      location: landDetails.location,
      area: ethers.utils.formatUnits(landDetails.area, 'ether'),
      ownerName: landDetails.ownerName,
      documentHash: landDetails.documentHash,
      price: ethers.utils.formatUnits(landDetails.price, 'ether'),
      isListed: landDetails.isListed,
      owner: landDetails.owner,
      timestamp: new Date(landDetails.timestamp * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error getting land details:', error);
    throw error;
  }
};

export const getOwnerLands = async (provider, ownerAddress) => {
  try {
    const contract = getLandContract(provider);
    const landIds = await contract.getOwnerLands(ownerAddress);
    const lands = await Promise.all(
      landIds.map(id => getLandDetails(provider, id))
    );
    return lands;
  } catch (error) {
    console.error('Error getting owner lands:', error);
    throw error;
  }
};

export const getListedLands = async (provider) => {
  try {
    const contract = getLandContract(provider);
    const landIds = await contract.getListedLands();
    const lands = await Promise.all(
      landIds.map(id => getLandDetails(provider, id))
    );
    return lands;
  } catch (error) {
    console.error('Error getting listed lands:', error);
    throw error;
  }
}; 