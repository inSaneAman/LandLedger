import { TfiSearch } from "react-icons/tfi";
import { Link } from "react-router-dom";

function NavigationBar() {
  return (
    <div className="pt-10 w-full px-25  flex items-center justify-center">
      <div className="flex items-center gap-x-12 flex-1">
        <Link
          to="/"
          className="font-clash-display text-[#BA6168] font-bold text-3xl"
        >
          LAND Ledger
        </Link>

        <ul className="flex gap-x-20 text-white text-lg font-inter">
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

      <div className="flex items-center gap-x-4 relative z-10">
        <Link className="p-2 rounded-full hover:bg-white/10 transition duration-300">
          <TfiSearch className="text-white text-2xl" />
        </Link>

        <Link
          to="/auth"
          className="border border-white text-white px-6 py-2 rounded-3xl font-medium hover:bg-[#BA6168] transition ease-in-out duration-300"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default NavigationBar;
