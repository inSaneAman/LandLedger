import Logo from "../assets/images/bglogo.png";
import Ellipse from "../assets/images/ellipse.png";

function LogoContainer() {
  return (
    <div className="relative flex items-center justify-center">
      <img
        src={Ellipse}
        alt="Ellipse"
        className="relative h-[400px] w-[400px] animate-spin"
      />

      <img src={Logo} alt="Logo" className="absolute h-[200px] w-[200px]" />
    </div>
  );
}

export default LogoContainer;
