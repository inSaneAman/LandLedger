import { motion } from "framer-motion";
import {  useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import BackgroundEffects from "../components/backgroundEffects";
import Card from "../components/card";
import PropertyData from "../helpers/propertyData";

function Listings() {
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCards = 3; 

  const handleScroll = (direction) => {
    const maxIndex = PropertyData.length - visibleCards;
    setScrollIndex((prev) => {
      if (direction === "left") return Math.max(prev - 1, 0);
      else return Math.min(prev + 1, maxIndex);
    });
  };


  return (
    <div className="relative bg-black min-h-screen flex flex-col items-center justify-start overflow-hidden pt-10">
      <BackgroundEffects />

      <h1 className="text-white text-5xl mb-20 font-clash-display">Featured Listings</h1>

      <div className="relative w-[90%] flex items-center justify-center">
        <button
          className="absolute left-5 z-10 bg-gray-900/70 text-white p-3 rounded-full hover:bg-gray-700 transition"
          onClick={() => handleScroll("left")}
        >
          <FaChevronLeft size={24} />
        </button>

        <div className="w-full overflow-hidden">
          <motion.div
            className="flex gap-8"
            animate={{ x: `-${scrollIndex * 50}%` }}
            transition={{ ease: "easeInOut", duration: 0.8 }}
          >
            {PropertyData.map((property) => (
              <div key={property.id} className="w-[25%] flex-shrink-0">
                <Card property={property} />
              </div>
            ))}
          </motion.div>
        </div>

        <button
          className="absolute right-5 z-10 bg-gray-900/70 text-white p-3 rounded-full hover:bg-gray-700 transition"
          onClick={() => handleScroll("right")}
        >
          <FaChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

export default Listings;
