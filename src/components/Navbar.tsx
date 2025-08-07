import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation(); // 현재 경로 가져오기
  const [selectedMenu, setSelectedMenu] = useState(location.pathname);

  useEffect(() => {
    setSelectedMenu(location.pathname);
  }, [location.pathname]); // 경로 변경될 때마다 선택된 메뉴 업데이트

  return (
    <nav className="fixed top-10 left-20 right-20 bg-gray-800 bg-opacity-90 backdrop-blur-md shadow-md rounded-xl z-50">
      <div className="container mx-auto px-20 py-4 flex justify-between items-center">
        {/* 로고 */}
        <Link to="/measurement" className="text-2xl font-semibold text-gray-200 pl-10">
          SKINNOL.
        </Link>

        {/* 메뉴 리스트 */}
        <div className="flex space-x-12 pr-10">
          <Link
            to="/survey-scan"
            className={`transition duration-300 ${
              selectedMenu === "/survey-scan" ? "text-white border-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Survey Scan
          </Link>
          <Link
            to="/measurement"
            className={`transition duration-300 ${
              selectedMenu === "/measurement" ? "text-white border-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Measurement
          </Link>
          <Link
            to="/analysis"
            className={`transition duration-300 ${
              selectedMenu === "/analysis" ? "text-white border-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Analysis
          </Link>
          <Link
            to="/calibration"
            className={`transition duration-300 ${
              selectedMenu === "/calibration" ? "text-white border-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Calibration
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
