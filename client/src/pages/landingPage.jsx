import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";

import PropertyImage from "../assets/images/property1.png";
import Wave from "../assets/images/wave2.png";
import BackgroundEffects from "../components/backgroundEffects";
import NavigationBar from "../components/navigationBar";

function LandingPage() {
  return (
    <div className="bg-black text-white h-screen ">
      <NavigationBar />
      <BackgroundEffects />
      <div className="grid grid-cols-2 pt-25 px-25 ">
        <div className="flex flex-col justify-center">
          <h1 className="text-6xl font-clash-display font-bold  ">
            Revolutionizing{" "}
            <span className="text-[#BA6168]">Land Registry</span> Through{" "}
            <span className="text-[#BA6168]">Blockchain</span>
          </h1>
          <img src={Wave} alt="Wave" className="py-7 max-w-fit" />
          <p className="text-md font-inter pt-7 line-clamp-6 text-left w-3/4">
            Experience the Future of Property Buying, Selling and Investing &
            Navigate the New Era of Digital Property Transactions with Ease and
            Security
          </p>
          <div className="grid grid-cols-2  items-center pt-7">
            <div className="flex ">
              <button className="bg-[#BA6168] text-white border border-white px-6 py-3 rounded-3xl text-center hover:bg-transparent transition-all ease-in-out">
                <Link to="/discover">Start Your Investment Journey</Link>
              </button>
            </div>
            <div className="flex items-center  text-[#BA6168] hover:text-white transition-all ease-in-out duration-300">
              <Link className="flex items-center gap-3 p-3">
                Explore Properties
                <span>
                  <FaArrowRight className="text-2xl text-thin" />{" "}
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <img
            src={PropertyImage}
            alt="Propery Image of Summer House"
            className="h-[561px] w-[593px]"
          />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
