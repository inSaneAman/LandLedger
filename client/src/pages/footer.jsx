import { FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

import BackgroundEffects from "../components/backgroundEffects";

function Footer() {
  return (
    <div className="relative bg-black text-white">
      <BackgroundEffects />

      <div className="flex flex-col items-center text-center py-16 border-t border-gray-500">
        <h1 className="font-bold font-clash-display text-3xl md:text-4xl max-w-2xl">
          Don’t miss out on the real estate evolution. Join us now.
        </h1>
        <button className="mt-6 bg-[#BA6168] border border-white rounded-3xl px-6 py-3 hover:bg-transparent transition-all ease-in-out duration-300">
          <Link to="/auth">Join Now</Link>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-8 py-12 max-w-6xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-[#BA6168]">Land Ledger</h2>
          <p className="text-sm text-gray-400 mt-3 max-w-xs">
            Land Ledeger is a blockchain-powered platform that transforms the
            way people buy, sell, and invest in real estate.
          </p>
          <div className="flex gap-3 mt-4">
            <span className="p-2 bg-[#BA6168] text-black rounded-full hover:text-white transition-all ease-in-out duration-300">
              <FaInstagram />
            </span>
            <span className="p-2 bg-[#BA6168] text-black rounded-full hover:text-white transition-all ease-in-out duration-300">
              <FaLinkedin />
            </span>
            <span className="p-2 bg-[#BA6168] text-black rounded-full hover:text-white transition-all ease-in-out duration-300">
              <FaXTwitter />
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3">Site Map</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="hover:text-white">
              <Link to="/">Home</Link>
            </li>
            <li className="hover:text-white">
              <Link to="/about">About</Link>
            </li>
            <li className="hover:text-white">
              <Link to="/exchange">Real Estate Exchange</Link>
            </li>
            <li className="hover:text-white">
              <Link to="/sell">Sell Property</Link>
            </li>
            <li className="hover:text-white">
              <Link to="/buy">Buy Property</Link>
            </li>
            <li className="hover:text-white">
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">Company</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="hover:text-white">
              <Link to="/support">Help & Support</Link>
            </li>
            <li className="hover:text-white">
              <Link to="/terms">Terms & Conditions</Link>
            </li>
            <li className="hover:text-white">
              <Link to="/privacy">Privacy Policy</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">Resource</h3>
          <ul className="space-y-2 text-gray-400 text-sm ">
            <li className="hover:text-white">
              <Link to="/partners">Partner</Link>
            </li>
            <li className="hover:text-white">
              <Link to="/blog">Blog</Link>
            </li>
            <li className="hover:text-white">
              <Link to="/newsletter">Newsletter</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm py-4 border-t border-gray-500">
        Copyright &copy; Land Ledger 2025 All rights reserved
      </div>
    </div>
  );
}

export default Footer;
