import BackgroundEffects from "../components/backgroundEffects";
import Card from "../components/card";

function Listings() {
    return (
      <div className="relative bg-black min-h-screen flex flex-col items-center justify-center">
        <BackgroundEffects />
        <h1 className="text-white flex items-center justify-center text-5xl mb-10">
          Featured Listings
        </h1>
        <div>
          <Card />
        </div>
      </div>
    );
    
    
}

export default Listings;
