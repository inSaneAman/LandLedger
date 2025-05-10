import PropTypes from "prop-types"; // Import PropTypes

function WorkingCard({ workflow }) {
  const {head, para} = workflow
  return (
    <div
      className="border-2 border-[#BA6168] rounded-lg p-6 w-[510px] max-w-md shadow-lg 
      bg-gradient-to-r from-[#BA6168]/50 to-[#1A1A1A]/50 backdrop-blur-md"
    >
      <div className="flex flex-col text-white">
        <h2 className="font-clash-display text-2xl font-bold mb-4">
          {head}
        </h2>
        <p className="font-clash-display font-thin text-sm">
          {para}
        </p>
      </div>
    </div>
  );
}

WorkingCard.propTypes = {
  workflow: PropTypes.shape({
    id: PropTypes.number.isRequired,
    head: PropTypes.string.isRequired,
    para: PropTypes.string.isRequired,
  }).isRequired,
};

export default WorkingCard;
