import { FaEthereum } from "react-icons/fa6";

function BackgroundEffects() {
  return (
    <>
      <div className="absolute z-{-5} top-10 left-40 w-[200px] h-[200px] bg-[#BA6168] opacity-50 blur-[100px] rounded-full"></div>
      <div className="absolute z-{-5} bottom-20 right-[25px] w-[150px] h-[150px] bg-[#BA6168] opacity-50 blur-[60px] rounded-full"></div>
      <div className="absolute z-{-5} top-0 right-[75px] w-[250px] h-[250px] bg-[#BA6168] opacity-50 blur-[90px] rounded-full"></div>

      <FaEthereum className="absolute z-{-5} top-20 left-1/3 text-[#BA6168] w-6 h-6 animate-pulse " />
      <FaEthereum className="absolute z-{-5} top-1/2 right-1/4 text-[#BA6168] w-5 h-5 animate-pulse" />
      <FaEthereum className="absolute z-{-5} bottom-24 left-1/4 text-[#BA6168] w-7 h-7 animate-pulse" />
      <FaEthereum className="absolute z-{-5} bottom-5 right-10 text-[#BA6168] w-4 h-4 animate-pulse" />
      <FaEthereum className="absolute z-{-5} bottom-5 left-10 text-[#BA6168] w-4 h-4 animate-pulse" />
      <FaEthereum className="absolute z-{-5} bottom-1/2 left-10 text-[#BA6168] w-7 h-7 animate-pulse" />
    </>
  );
}

export default BackgroundEffects;
