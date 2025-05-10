import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function FeatureCard({ title, features, button, linkTo, imgSrc, isReversed }) {
  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between w-full py-12 px-8 md:px-16 ${isReversed ? "md:flex-row-reverse" : ""}`}
    >
      <div className="w-full md:w-1/2 flex justify-center">
        <img src={imgSrc} alt={title} className="max-w-sm w-full h-auto" />{" "}
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h1 className="font-clash-display text-4xl font-bold mb-4">{title}</h1>
        <ul className="font-inter font-light text-lg space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="text-[#BA6168] font-bold text-xl mr-2">★</span>
              <span>
                <span className="text-[#BA6168] font-semibold">
                  {feature.head}:{" "}
                </span>
                {feature.description}
              </span>
            </li>
          ))}
        </ul>

        <Link
          to={linkTo}
          className="mt-4 w-[200px] text-center border border-white bg-[#BA6168] rounded-3xl px-4 py-2 text-white hover:bg-transparent transition-all duration-300"
        >
          {button}
        </Link>
      </div>
    </div>
  );
}

FeatureCard.propTypes = {
  title: PropTypes.string.isRequired,
  features: PropTypes.arrayOf(
    PropTypes.shape({
      head: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  button: PropTypes.string.isRequired,
  linkTo: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  isReversed: PropTypes.bool,
};

FeatureCard.defaultProps = {
  isReversed: false,
};

export default FeatureCard;
