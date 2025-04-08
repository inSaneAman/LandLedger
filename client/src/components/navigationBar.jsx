import { motion, useScroll, useTransform } from "framer-motion";
import { TfiSearch } from "react-icons/tfi";
import { Link as ScrollLink } from "react-scroll";
import { useState, useEffect } from "react";
import { connectWallet, getStoredWalletAddress, setupWalletListeners, disconnectWallet } from "../utils/web3";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
      const walletData = await connectWallet();
      setWalletAddress(walletData.address);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      if (error.message === 'Please install MetaMask to use this feature') {
        toast.error("Please install MetaMask to connect your wallet");
      } else {
        toast.error("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      if (window.ethereum) {
        // Request account access to open MetaMask
        await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
      }
      disconnectWallet();
      setWalletAddress("");
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
        <button className="p-2 rounded-full hover:bg-white/10 transition duration-300">
          <TfiSearch className="text-white text-2xl" />
        </button>

        {userRole === "inspector" && (
          <button
            onClick={handleLandRegister}
            className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300"
          >
            Land Register
          </button>
        )}
        <button
          onClick={handleAddProperty}
          className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300"
        >
          Add Property
        </button>
        <span className="text-white font-medium">
          {formatAddress(walletAddress)}
        </span>
        <button 
          onClick={handleDisconnectWallet}
          className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300"
        >
          Disconnect
        </button>
      </div>
    </motion.div>
  );
}

export default NavigationBar;
