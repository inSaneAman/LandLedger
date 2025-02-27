import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

import BackgroundEffects from "../components/backgroundEffects";
import LogoContainer from "../components/logoContainer";

function WhyChooseUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5, once: false });

  return (
    <div
      ref={ref}
      className="relative bg-black min-h-screen flex items-center justify-center"
    >
      <BackgroundEffects />
      <div className="grid grid-cols-2 items-center px-25 w-full">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
          transition={{ duration: 0.8 }}
        >
          <LogoContainer />
        </motion.div>

        <motion.div
          className="text-white justify-stretch"
          initial={{ opacity: 0, y: 100 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-semibold font-inter pb-10">
            Why Choose Us?
          </h1>
          <p className="pb-10 font-inter font-thin">
            Platlo is a blockchain-powered platform that transforms the way
            people buy, sell, and invest in real estate. It combines elements of
            a real estate exchange, metaverse visualization, property
            tokenization, and NFT-based document security. Platlo aims to
            simplify real estate transactions, offering an immersive metaverse
            experience for property visualization. Additionally, it facilitates
            fractional ownership and rental management, turning real estate
            investments into a dynamic and profitable venture.
          </p>
          <motion.button
            className="bg-[#BA6168] border border-white px-6 py-2 rounded-3xl hover:bg-transparent transition-all ease-in-out duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Link to="/auth">Sell Property</Link>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default WhyChooseUs;
