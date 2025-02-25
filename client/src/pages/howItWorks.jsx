import { motion } from "framer-motion";
import { FaArrowDown } from "react-icons/fa"; // Downward arrow icon

import BackgroundEffects from "../components/backgroundEffects";
import WorkingCard from "../components/workingCard";
import workFlow from "../helpers/workFlow";

function HowItWorks() {
  return (
    <div className="relative bg-black text-white min-h-screen flex flex-col items-center">
      <BackgroundEffects />

      {/* Title and Description */}
      <div className="text-center p-10">
        <h1 className="font-clash-display font-bold text-3xl">
          How the Exchange Works
        </h1>
        <p className="font-inter font-extralight text-sm max-w-sm mt-3">
          Below is the Property Exchange process that will securely handle your
          properties.
        </p>
      </div>

      {/* Workflow Container - Zigzag Pattern */}
      <div className="relative flex flex-col items-center w-full max-w-6xl space-y-16">
        {workFlow.map((workflow, index) => (
          <motion.div
            key={workflow.id}
            className={`relative flex items-center w-full px-10 ${
              index % 2 === 0 ? "justify-start" : "justify-end"
            }`}
            initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: index * 0.2, // Staggered animation
            }}
            viewport={{ once: true, amount: 0.2 }} // Trigger when 20% in view
          >
            {/* Animated Card */}
            <WorkingCard workflow={workflow} />

            {/* Animated Arrow Down (Only if it's not the last item) */}
            {index !== workFlow.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2 + 0.3, // Slight delay for arrows
                }}
                viewport={{ once: true, amount: 0.2 }}
                className="absolute bottom-[-40px] flex justify-center w-full text-[#BA6168] text-2xl"
              >
                <FaArrowDown />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default HowItWorks;
