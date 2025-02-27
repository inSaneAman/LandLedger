import { motion, useScroll, useTransform } from "framer-motion";
import { TfiSearch } from "react-icons/tfi";
import { Link as ScrollLink } from "react-scroll";

function NavigationBar() {
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.1], ["0px", "8px"]);
  const translateY = useTransform(scrollYProgress, [0, 0.1], [0, -50]);

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

        <button className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300">
          Connect Wallet
        </button>
      </div>
    </motion.div>
  );
}

export default NavigationBar;
