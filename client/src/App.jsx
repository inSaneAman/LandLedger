import "./App.css";

import { Route, Routes } from "react-router-dom";

import FirstSlide from "./pages/firstSlide";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<FirstSlide />}></Route>
      </Routes>
    </>
  );
}

export default App;
