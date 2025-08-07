import React, { useEffect, useState } from "react";
import ImageToggleDropdown from "../../components/ImageToggleDropdown";
import ImagePreview from "../../components/ImagePreview";
import IntegrationGraph from "./IntegrationGraph";
import LoadingOverlay from "../../components/LoadingOverlay";

const Analysis: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [integrationSections, setIntegrationSections] = useState<any[]>([]);
  const [ratios, setRatios] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedImage) return;

    setIsLoading(true);
    setRatios([]);

    fetch(`http://192.168.12.46:5000/image_spectrum_sections?filename=${selectedImage}`)
      .then(res => res.json())
      .then(json => {
        if (!json.sections || !Array.isArray(json.sections)) {
          console.warn("잘못된 sections 데이터:", json);
          setIntegrationSections([]);
        } else {
          setIntegrationSections(json.sections);
        }
      })
      .catch(err => {
        console.error("sections fetch 실패:", err);
        setIntegrationSections([]);
      });
  }, [selectedImage]);


  // 🔹 섹션 데이터 받아온 후 → 그래프 렌더링까지 기다렸다가 로딩 끔
  useEffect(() => {
    if (integrationSections.length > 0) {
      setTimeout(() => setIsLoading(false), 0); // 렌더링까지 고려해서 끔
    }
  }, [integrationSections]);

  const handleXPointsSelected = (points: number[]) => {
    setIsLoading(true); // ⏳ 로딩 시작

    fetch("http://192.168.12.46:5000/image_spectrum_integration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: selectedImage,
        x1: points[0],
        x2: points[1],
        x3: points[2],
        x4: points[3],
      }),
    })
      .then(res => res.json())
      .then(json => {
        const newRatios = Array.isArray(json) ? json : json.ratios;
        if (!newRatios || !Array.isArray(newRatios)) {
          console.warn("잘못된 ratios 데이터:", json);
          setRatios([]);
        } else {
          setRatios(newRatios);
        }
      })
      .catch(err => {
        console.error("적분 fetch 실패:", err);
        setRatios([]);
      });
    // ❌ isLoading 여기서도 끄지 않음
  };

  // 🔹 비율 데이터 바뀌면 → 그려진 뒤 로딩 끔
  useEffect(() => {
    if (ratios.length > 0) {
      setTimeout(() => setIsLoading(false), 0);
    }
  }, [ratios]);

  return (
    <div className="flex w-full h-[calc(100vh-80px)] p-10">
      {isLoading && <LoadingOverlay />}

      {/* 왼쪽 */}
      <div className="flex-[3] flex pl-10 flex-col items-center pt-10">
        <ImageToggleDropdown onSelect={setSelectedImage} />
        <div className="w-[95%] h-[100%] mt-10 bg-gray-700 rounded-2xl flex justify-center items-center">
          <ImagePreview filename={selectedImage} />
        </div>
      </div>

      {/* 중앙 */}
      <div className="flex-[4] flex flex-col items-center pt-10">
        <div className="text-[clamp(14px,1.5vw,22px)] font-bold mb-4">이미지 그래프</div>
        <div className="w-[95%] h-[100%] mt-10 bg-gray-700 rounded-2xl flex justify-center items-center">
          {integrationSections.length > 0 ? (
            <IntegrationGraph
              sections={integrationSections}
              mode="curve"
              onFinishSelect={handleXPointsSelected}
            />
          ) : (
            <span className="text-[clamp(8px,1vw,16px)] opacity-50">이미지를 선택하세요</span>
          )}
        </div>
      </div>

      {/* 오른쪽 */}
      <div className="flex-[2] flex flex-col pr-10 items-center pt-10">
        <div className="text-[clamp(14px,1.5vw,22px)] font-bold mb-4">적분 비율</div>
        <div className="w-[95%] h-[100%] mt-10 bg-gray-700 rounded-2xl flex justify-center items-center">
          {ratios.length > 0 ? (
            <IntegrationGraph
              sections={[]}
              ratios={ratios}
              mode="ratio"
            />
          ) : (
            <span className="text-[clamp(8px,1vw,16px)] opacity-50 text-white">비율 그래프</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;
