import { motion, useScroll, useTransform } from "framer-motion";
import { TfiSearch } from "react-icons/tfi";
import { Link as ScrollLink } from "react-scroll";
import { useState, useEffect } from "react";
import { connectWallet, getStoredWalletAddress, setupWalletListeners, disconnectWallet } from "../utils/web3";
import { getUserRole } from "../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function NavigationBar() {
  const { scrollYProgress } = useScroll();
  const [walletAddress, setWalletAddress] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.1], ["0px", "8px"]);
  const translateY = useTransform(scrollYProgress, [0, 0.1], [0, -50]);

  useEffect(() => {
    // Check for stored wallet address on component mount
    const storedAddress = getStoredWalletAddress();
    if (storedAddress) {
      setWalletAddress(storedAddress);
      checkUserRole(storedAddress);
    }

    // Setup wallet event listeners
    setupWalletListeners(
      (address) => {
        setWalletAddress(address);
        checkUserRole(address);
      },
      () => window.location.reload()
    );
  }, []);

  const checkUserRole = async (address) => {
    try {
      const role = await getUserRole(address);
      setUserRole(role);
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole(null);
    }
  };

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

        <div className="flex items-center gap-x-8">
          <ScrollLink
            to="properties"
            smooth={true}
            duration={500}
            className="text-gray-700 hover:text-[#BA6168] cursor-pointer"
          >
            Properties
          </ScrollLink>
          <ScrollLink
            to="about"
            smooth={true}
            duration={500}
            className="text-gray-700 hover:text-[#BA6168] cursor-pointer"
          >
            About
          </ScrollLink>
          <ScrollLink
            to="contact"
            smooth={true}
            duration={500}
            className="text-gray-700 hover:text-[#BA6168] cursor-pointer"
          >
            Contact
          </ScrollLink>
        </div>
      </div>

      <div className="flex items-center gap-x-6">
        <button className="p-2 rounded-full hover:bg-white/10 transition duration-300">
          <TfiSearch className="text-white text-2xl" />
        </button>

        {walletAddress ? (
          <>
            <button
              onClick={handleAddProperty}
              className="bg-[#BA6168] text-white px-6 py-2 rounded-lg hover:bg-[#A55158] transition-colors"
            >
              Add Property
            </button>
            {userRole === 'inspector' && (
              <button
                onClick={() => navigate('/verify-properties')}
                className="bg-[#BA6168] text-white px-6 py-2 rounded-lg hover:bg-[#A55158] transition-colors"
              >
                Verify Properties
              </button>
            )}
            <button
              onClick={handleDisconnectWallet}
              className="text-gray-700 hover:text-[#BA6168] transition-colors"
            >
              {formatAddress(walletAddress)}
            </button>
          </>
        ) : (
          <button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="bg-[#BA6168] text-white px-6 py-2 rounded-lg hover:bg-[#A55158] transition-colors disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default NavigationBar;
