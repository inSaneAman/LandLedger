import { Link } from "react-router-dom";

import BackgroundEffects from "../components/backgroundEffects";
import LogoContainer from "../components/logoContainer";

function WhyChooseUs() {
  return (
    <div className="relative bg-black min-h-screen flex items-center justify-center">
      <BackgroundEffects />
      <div className="grid grid-cols-2 items-center px-25 w-full">
        <div>
          <LogoContainer />
        </div>
        <div className="text-white justify-stretch">
          <h1 className="text-5xl font-semibold font-inter pb-10 ">
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
          <button className="bg-[#BA6168] px-6 py-2 rounded-3xl">
            <Link to="/sell">Sell Property</Link>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WhyChooseUs;
