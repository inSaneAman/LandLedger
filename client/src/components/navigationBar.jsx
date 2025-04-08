import { motion, useScroll, useTransform } from "framer-motion";
import { TfiSearch } from "react-icons/tfi";
import { Link as ScrollLink } from "react-scroll";
import { useState, useEffect } from "react";
import { connectWallet, getStoredWalletAddress, setupWalletListeners, disconnectWallet } from "../utils/web3";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function NavigationBar() {
  const { scrollYProgress } = useScroll();
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.1], ["0px", "8px"]);
  const translateY = useTransform(scrollYProgress, [0, 0.1], [0, -50]);

  useEffect(() => {
    // Check for stored wallet address on component mount
    const storedAddress = getStoredWalletAddress();
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }

    // Get user role from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { role } = JSON.parse(userData);
      setUserRole(role);
    }

    // Setup wallet event listeners
    setupWalletListeners(
      (address) => setWalletAddress(address),
      () => window.location.reload()
    );
  }, []);

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast.error("Please install MetaMask to connect your wallet");
        return;
      }

      // Request account access and open MetaMask popup
      const accounts = await window.ethereum.request({ 
        method: 'wallet_requestPermissions',
        params: [{
          eth_accounts: {}
        }]
      });

      if (!accounts || accounts.length === 0) {
        toast.error("No account selected");
        return;
      }

      // Get the current account after permission is granted
      const currentAccounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });

      if (currentAccounts.length === 0) {
        toast.error("No account available");
        return;
      }

      const selectedAccount = currentAccounts[0];
      
      try {
        // Check if user exists in database
        const response = await axios.get(`http://localhost:5000/api/users/wallet/${selectedAccount}`);
        
        if (response.data) {
          // User exists, update UI and store data
          setWalletAddress(selectedAccount);
          setUserRole(response.data.role);
          localStorage.setItem('walletAddress', selectedAccount);
          localStorage.setItem('userData', JSON.stringify({
            id: response.data._id,
            role: response.data.role,
            walletAddress: selectedAccount
          }));
          localStorage.setItem('token', response.data.token);
          toast.success("Wallet connected successfully!");
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // User not found, navigate to role selection
          setWalletAddress(selectedAccount);
          localStorage.setItem('walletAddress', selectedAccount);
          navigate('/auth', { 
            state: { 
              walletAddress: selectedAccount,
              isNewUser: true 
            } 
          });
        } else {
          console.error("Error checking user:", error);
          toast.error("Failed to verify user. Please try again.");
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      if (error.code === 4001) {
        toast.error("Please select an account in MetaMask");
      } else {
        toast.error("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      // Remove wallet address from localStorage
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      
      // Reset state
      setWalletAddress("");
      setUserRole("");
      
      // Reload the page to reset all states
      window.location.reload();
      
      toast.success("Wallet disconnected successfully!");
    } catch (error) {
      console.error("Error during disconnect:", error);
      toast.error("Failed to disconnect wallet. Please try again.");
    }
  };

  const handleAddProperty = () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }
    navigate("/add-property");
  };

  const handleLandRegister = () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }
    navigate("/land-register");
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-20 px-10 flex items-center justify-between 
      bg-white/10 backdrop-blur-xl rounded-b-lg shadow-lg z-50 transition-all duration-300"
      style={{
        opacity,
        filter: `blur(${blur})`,
        y: translateY,
      }}
    >
      <div className="flex items-center gap-x-12">
        <ScrollLink
          to="home"
          smooth={true}
          duration={500}
          className="font-clash-display text-[#BA6168] font-bold text-3xl cursor-pointer"
        >
          LAND Ledger
        </ScrollLink>

        <ul className="flex gap-x-12 text-white text-lg font-inter">
          <li>
            <ScrollLink
              to="why-choose-us"
              smooth={true}
              duration={500}
              offset={-80}
              className="font-light hover:text-[#BA6168] transition duration-300 cursor-pointer"
            >
              Why Choose Us
            </ScrollLink>
          </li>
          <li>
            <ScrollLink
              to="listings"
              smooth={true}
              duration={500}
              offset={-80}
              className="font-light hover:text-[#BA6168] transition duration-300 cursor-pointer"
            >
              Listings
            </ScrollLink>
          </li>
          <li>
            <ScrollLink
              to="how-it-works"
              smooth={true}
              duration={500}
              offset={-80}
              className="font-light hover:text-[#BA6168] transition duration-300 cursor-pointer"
            >
              How it Works
            </ScrollLink>
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-x-6">
        {/* <button className="p-2 rounded-full hover:bg-white/10 transition duration-300">
          <TfiSearch className="text-white text-2xl" />
        </button> */}

        {userRole === "inspector" && (
          <button
            onClick={handleLandRegister}
            className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300"
          >
            Land Register
          </button>
        )}
        {(userRole === "seller" || userRole === "inspector") && (
          <button
            onClick={handleAddProperty}
            className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300"
          >
            Add Property
          </button>
        )}
        {walletAddress ? (
          <>
            <span className="text-white font-medium">
              {formatAddress(walletAddress)}
            </span>
            <button 
              onClick={handleDisconnectWallet}
              className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button 
            onClick={handleConnectWallet}
            className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300"
          >
            Connect
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default NavigationBar;
