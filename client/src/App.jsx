import NavigationBar from "./components/navigationBar";
import Footer from "./pages/footer";
import HowItWorks from "./pages/HowItWorks";
import LandingPage from "./pages/landingPage";
import Listings from "./pages/Listings";
import OurFeatures from "./pages/OurFeatures";
import WhyChooseUs from "./pages/WhyChooseUs";

function App() {
  return (
    <div className="bg-black text-white">
      <NavigationBar />

      <section id="home" className="pt-20">
        <LandingPage />
      </section>

      <section id="why-choose-us" className="pt-20">
        <WhyChooseUs />
      </section>

      <section id="listings" className="pt-20">
        <Listings />
      </section>

      <section id="how-it-works" className="pt-20">
        <HowItWorks />
      </section>

      <section id="our-features" className="pt-20">
        <OurFeatures />
      </section>

      <section id="footer" className="pt-20">
        <Footer />
      </section>
    </div>
  );
}

export default App;
