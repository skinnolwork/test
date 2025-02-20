import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation(); // 현재 경로 가져오기
  const [selectedMenu, setSelectedMenu] = useState(location.pathname);

  useEffect(() => {
    setSelectedMenu(location.pathname);
  }, [location.pathname]); // 경로 변경될 때마다 선택된 메뉴 업데이트

  return (
    <nav className="fixed top-10 left-20 right-20 bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-md rounded-xl z-50">
      <div className="container mx-auto px-8 py-4 flex justify-between items-center">
        {/* 로고 */}
        <Link to="/" className="text-2xl font-semibold text-gray-200">
          SKINNOL.
        </Link>

        {/* 메뉴 리스트 */}
        <div className="flex space-x-4">
          <Link
            to="/individual-analysis"
            className={`transition duration-300 ${
              selectedMenu === "/individual-analysis" ? "text-white border-white" : "text-gray-400 hover:text-white"
            }`}
          >
            개별 분석(피부)
          </Link>
          <Link
            to="/comparison-analysis"
            className={`transition duration-300 ${
              selectedMenu === "/comparison-analysis" ? "text-white border-white" : "text-gray-400 hover:text-white"
            }`}
          >
            비교 분석
          </Link>
          <Link
            to="/cosmetic-data"
            className={`transition duration-300 ${
              selectedMenu === "/cosmetic-data" ? "text-white border-white" : "text-gray-400 hover:text-white"
            }`}
          >
            화장품 데이터
          </Link>
          <Link
            to="/calibration"
            className={`transition duration-300 ${
              selectedMenu === "/calibration" ? "text-white border-white" : "text-gray-400 hover:text-white"
            }`}
          >
            캘리브레이션
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
