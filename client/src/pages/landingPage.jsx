import BackgroundEffects from "../components/backgroundEffects";
import NavigationBar from "../components/navigationBar";

function LandingPage() {
  return (
    <div className="bg-black text-white h-screen ">
      <NavigationBar />
      <BackgroundEffects/>
    </div>
  );
}

export default LandingPage;
