import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import IndividualAnalysis from "./pages/IndividualAnalysis";
import ComparisonAnalysis from "./pages/ComparisonAnalysis";
import CosmeticData from "./pages/CosmeticData";
import Calibration from "./pages/Calibration";
import Graphs from "./pages/Graphs";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/individual-analysis" element={<IndividualAnalysis />} />
          <Route path="/comparison-analysis" element={<ComparisonAnalysis />} />
          <Route path="/cosmetic-data" element={<CosmeticData />} />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/graphs" element={<Graphs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
