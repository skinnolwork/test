import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Measurement from "./pages/Measurement/Measurement";
import SurveyScan from "./pages/SurveyScan/SurveyScan";
import Analysis from "./pages/Analysis/Analysis";
import Calibration from "./pages/Calibration/Calibration";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<SurveyScan />} />
          <Route path="/survey-scan" element={<SurveyScan />} />
          <Route path="/measurement" element={<Measurement />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/calibration" element={<Calibration />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
