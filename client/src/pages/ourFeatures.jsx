import { motion } from "framer-motion";

import BackgroundEffects from "../components/backgroundEffects";
import FeatureCard from "../components/featureCard";
import features from "../helpers/features";

function OurFeatures() {
  return (
    <div className="relative bg-black text-white min-h-screen flex flex-col items-center overflow-x-hidden">
      <BackgroundEffects />
      <div className="text-center p-10">
        <h1 className="font-clash-display font-bold text-3xl">Our Features</h1>
        <p className="font-inter font-extralight text-sm max-w-sm mt-3">
          Below are some of our high-class features that will be offered by Land
          Ledger.
        </p>
      </div>

      <div className="w-full md:px-20">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, translateX: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, translateX: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
            className="w-full"
          >
            <FeatureCard
              title={feature.title}
              features={feature.features}
              button={feature.button}
              linkTo={feature.linkTo}
              imgSrc={feature.imgSrc}
              isReversed={index % 2 !== 0}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default OurFeatures;
