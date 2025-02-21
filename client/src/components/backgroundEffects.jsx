//import { Sparkles } from "lucide-react"; // Import the Sparkles icon
import { SiPolestar } from "react-icons/si";

function BackgroundEffects() {
  return (
    <>
      <div className="absolute top-10 left-40 w-[200px] h-[200px] bg-[#BA6168] opacity-50 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-20 right-[25px] w-[150px] h-[150px] bg-[#BA6168] opacity-50 blur-[60px] rounded-full"></div>
      <div className="absolute top-0 right-[75px] w-[250px] h-[250px] bg-[#BA6168] opacity-50 blur-[90px] rounded-full"></div>

      <SiPolestar className="absolute top-20 left-1/3 text-[#BA6168] w-6 h-6 animate-pulse " />
      <SiPolestar className="absolute top-1/2 right-1/4 text-[#BA6168] w-5 h-5 animate-pulse" />
      <SiPolestar className="absolute bottom-24 left-1/4 text-[#BA6168] w-7 h-7 animate-pulse" />
      <SiPolestar className="absolute bottom-5 right-10 text-[#BA6168] w-4 h-4 animate-pulse" />
    </>
  );
}

export default BackgroundEffects;
