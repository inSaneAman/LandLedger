import "./App.css";

import { Route, Routes } from "react-router-dom";

import LandingPage from "../src/pages/landingPage";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
      </Routes>
    </>
  );
}

export default App;
