import HowItWorks from "./HowItWorks";
import LandingPage from "./landingPage";
import Listings from "./listings";
import WhyChooseUs from "./whyChooseUs";

function FirstSlide() {
  return (
    <div>
      <LandingPage />
      <WhyChooseUs />
      <Listings />
      <HowItWorks/>
    </div>
  );
}

export default FirstSlide;
