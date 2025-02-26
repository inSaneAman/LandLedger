import HowItWorks from "./HowItWorks";
import LandingPage from "./landingPage";
import Listings from "./listings";
import OurFeatures from "./ourFeatures";
import WhyChooseUs from "./whyChooseUs";

function FirstSlide() {
  return (
    <div>
      <LandingPage />
      <WhyChooseUs />
      <Listings />
      <HowItWorks/>
      <OurFeatures/>
    </div>
  );
}

export default FirstSlide;
