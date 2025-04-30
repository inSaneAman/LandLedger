import NavigationBar from "./components/navigationBar";
import Footer from "./pages/footer";
import HowItWorks from "./pages/HowItWorks";
import LandingPage from "./pages/landingPage";
import Listings from "./pages/listings";
import OurFeatures from "./pages/OurFeatures";
import WhyChooseUs from "./pages/WhyChooseUs";
import AddProperty from "./pages/AddProperty";
import LandRegister from "./components/LandRegister";
import PropertyDetail from './pages/PropertyDetail';
import AdminDashboard from './pages/AdminDashboard';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Login from "./components/auth/Login";

function App() {
  return (
    <Router>
      <div className="bg-black text-white">
        <NavigationBar />

        <Routes>
          <Route path="/" element={
            <>
              <section id="home" className="pt-20">
                <LandingPage />
              </section>

              <section id="why-choose-us" className="py-20 bg-gray-900/30">
                <WhyChooseUs />
              </section>

              <section id="featured-listings" className="py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                  <h2 className="text-3xl font-clash-display font-bold mb-10 text-center">Featured Properties</h2>
                  <Listings />
                </div>
              </section>

              <section id="how-it-works" className="py-20 bg-gray-900/30">
                <HowItWorks />
              </section>

              <section id="our-features" className="py-20">
                <OurFeatures />
              </section>

              <section id="footer" className="pt-20">
                <Footer />
              </section>
            </>
          } />
          <Route path="/listings" element={<Listings />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/land-register" element={<LandRegister />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path='/auth' element={<Login/>}/>
          <Route path='/admin' element={<AdminDashboard />} />
        </Routes>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
