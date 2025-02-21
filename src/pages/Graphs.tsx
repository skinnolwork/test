import { useLocation } from "react-router-dom";

const Graphs = () => {
  const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  // const from = searchParams.get("from");
  // const selectedItem = searchParams.get("cosmetic-data"); // 화장품 데이터에서 넘어온 값

  // const imageSrc = selectedItem ? `../../public/graph_images/resized_Mono12_20250205_162053` : null
  const imageSrc = `/graph_images/resized_Mono12_20250205_162053.png`;

  return (
    <div className="p-6 text-white flex flex-col h-[80vh]">
      <div className="flex flex-grow justify-between items-center w-full max-w-screen-xl mx-auto">
        {/* 이미지 영역 */}
        <div className="w-1/2 flex justify-center items-center bg-gray-800 rounded-lg p-4">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="분석 이미지"
              className="w-full h-full object-contain rounded-lg shadow-md"
            />
          ) : (
            <p className="text-gray-400">이미지를 불러올 수 없습니다.</p>
          )}
        </div>
        
        <div className="w-1/2 flex justify-center items-center bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400">여기에 그래프가 들어갈 예정</p>
        </div>
      </div>
    </div>
  );
};

export default Graphs;
