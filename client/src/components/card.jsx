import PropTypes from "prop-types"; // Import PropTypes
import { useEffect, useRef } from "react";
import { FaEthereum } from "react-icons/fa6";
import { Link } from "react-router-dom";

function Card({ property }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const { lat, long, price, builders, builderLogoUrl, owner, propertyType } =
    property;

  useEffect(() => {
    if (!mapRef.current || !window.H) return;

    if (!mapInstance.current) {
      const platform = new window.H.service.Platform({
        apikey: import.meta.env.VITE_HERE_MAP_API_KEY,
      });

      const defaultLayers = platform.createDefaultLayers();
      mapInstance.current = new window.H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          center: { lat, lng: long },
          zoom: 17,
          pixelRatio: window.devicePixelRatio || 1,
        }
      );

      new window.H.mapevents.Behavior(
        new window.H.mapevents.MapEvents(mapInstance.current)
      );

      const ui = window.H.ui.UI.createDefault(
        mapInstance.current,
        defaultLayers
      );
      ui.getControl("mapsettings").setVisibility(false);
      ui.getControl("scalebar").setVisibility(false);
      ui.getControl("zoom").setAlignment("top-left");

      const marker = new window.H.map.Marker({ lat, lng: long });
      mapInstance.current.addObject(marker);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.dispose();
        mapInstance.current = null;
      }
    };
  }, [lat, long]);

  return (
    <div className="relative w-80 h-[420px] flex flex-col justify-between">
      <div
        ref={mapRef}
        className="w-full h-60 rounded-t-xl border-2 overflow-hidden"
        style={{
          borderRadius: "12px",
          border: "2px solid rgba(186, 97, 104, 0.7)",
          boxShadow: "0px 0px 10px rgba(186, 97, 104, 0.8)",
        }}
      />

      <div
        className="relative h-[220px] backdrop-blur-3xl bg-opacity-20 bg-white/20 rounded-xl border-2"
        style={{
          border: "2px solid rgba(186, 97, 104, 0.7)",
          boxShadow: "0px 0px 40px rgba(186, 97, 104, 0.8)",
        }}
      >
        <div className="absolute backdrop-blur-3xl bg-opacity-10 rounded-xl flex items-center justify-center font-clash-display">
          <span className="relative flex items-center gap-1 text-white px-5 py-2 font-semibold text-center">
            <FaEthereum className="text-lg" /> {price}{" "}
            <span className="text-[#BA6168]">ETH</span>
          </span>
        </div>

        <div className="absolute backdrop-blur-3xl bg-opacity-10 rounded-xl flex items-center justify-center top-0 right-0">
          <button className="relative flex items-center gap-1 text-white rounded-xl px-5 py-2 font-clash-display text-center hover:bg-[#BA6168] transition-all ease-in-out duration-300">
            Place bid
          </button>
        </div>

        <div className="mt-14 px-5 text-white font-inter font-light">
          <div className="text-lg font-semibold">
            Listed by <span className="text-[#BA6168]">{builders}</span>
          </div>

          <div className="flex items-center gap-3 py-2">
            <img
              src={builderLogoUrl}
              alt={builders}
              className="h-[30px] w-[30px] rounded-full border border-white"
            />
            <p>{owner}</p>
          </div>

          <div className="text-sm text-gray-300 font-inter">
            Property Type:{" "}
            <span className="text-[#BA6168]">{propertyType}</span>
          </div>

          <div className="flex font-inter justify-end cursor-pointer hover:text-[#BA6168] transition-all ease-in-out duration-300">
            <Link to={`/property/${property.id}`}>View details</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

Card.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.number.isRequired,
    lat: PropTypes.number.isRequired,
    long: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    builders: PropTypes.string.isRequired,
    builderLogoUrl: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    propertyType: PropTypes.string.isRequired,
  }).isRequired,
};

export default Card;
