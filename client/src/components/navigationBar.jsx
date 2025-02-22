import { motion, useScroll, useTransform } from "framer-motion";
import { TfiSearch } from "react-icons/tfi";
import { Link } from "react-router-dom";

function NavigationBar() {
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.8], ["0px", "8px"]);
  const translateY = useTransform(scrollYProgress, [0, 0.8], [0, -50]);

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
      {/* Left Section */}
      <div className="flex items-center gap-x-12">
        <Link
          to="/"
          className="font-clash-display text-[#BA6168] font-bold text-3xl"
        >
          LAND Ledger
        </Link>

        <ul className="flex gap-x-12 text-white text-lg font-inter">
          <li>
            <Link
              to="/discover"
              className="font-light hover:text-[#BA6168] transition duration-300"
            >
              Discover
            </Link>
          </li>
          <li>
            <Link
              to="/marketplace"
              className="font-light hover:text-[#BA6168] transition duration-300"
            >
              Marketplace
            </Link>
          </li>
          <li>
            <Link
              to="/how-it-works"
              className="font-light hover:text-[#BA6168] transition duration-300"
            >
              How it Works
            </Link>
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-x-6">
        <Link className="p-2 rounded-full hover:bg-white/10 transition duration-300">
          <TfiSearch className="text-white text-2xl" />
        </Link>

        <Link
          to="/auth"
          className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300"
        >
          Connect Wallet
        </Link>
      </div>
    </motion.div>
  );
}

export default NavigationBar;
