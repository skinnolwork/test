import React, { useEffect } from "react";

const LoadingOverlay: React.FC = () => {
  useEffect(() => {
    const interval = setInterval(() => {}, 300); // 메시지 삭제로 필요 없음
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center"
      style={{ pointerEvents: "all", cursor: "not-allowed" }}
    >
      {/* 🔵 회전 스피너 */}
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default LoadingOverlay;
