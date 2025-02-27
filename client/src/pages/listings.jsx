import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

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

  const controls = useAnimation();
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <div
      ref={ref}
      className="relative bg-black min-h-screen flex flex-col items-center justify-start overflow-hidden pt-10"
    >
      <BackgroundEffects />
      <div className="text-center p-10">
        <h1 className="font-clash-display font-bold text-3xl">
          Featured Listings{" "}
        </h1>
        <p className="font-inter font-extralight text-sm max-w-sm mt-3">
          Below are some featured property listings.
        </p>
      </div>


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
            {PropertyData.map((property, index) => (
              <motion.div
                key={property.id}
                className="w-[25%] flex-shrink-0"
                initial="hidden"
                animate={controls}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: "easeOut",
                      delay: index * 0.2,
                    },
                  },
                }}
              >
                <Card property={property} />
              </motion.div>
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
