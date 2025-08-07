import React, { useState, useEffect } from "react";
import ImageToggleDropdown from "../../components/ImageToggleDropdown";
import ImagePreview from "../../components/ImagePreview";
import SimilaritySpectrumGraph from "./SimilaritySpectrumGraph";
import LoadingOverlay from "../../components/LoadingOverlay";

interface Top5Item {
  file: string;
  combined: number;
  x_original: number[];
  y_original: number[];
}

// 🔸 텍스트 길이 추정 함수
const estimateTextWidth = (text: string, fontSize = 10) => text.length * fontSize * 0.6;

const Measurement: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [spectrum, setSpectrum] = useState<[number[], number[]] | null>(null);
  const [top5List, setTop5List] = useState<Top5Item[]>([]);
  const [selectedSimilar, setSelectedSimilar] = useState<Top5Item | null>(null);
  const [libraryList, setLibraryList] = useState<string[]>([]);
  const [highlightRange, setHighlightRange] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);


  const handleRowSelect = async (row: number) => {
    if (!selectedImage) return;
    setSelectedRow(row);

    try {
      const res = await fetch(
        `http://192.168.12.46:5000/image_spectrum_row1?filename=${selectedImage}&row=${row}`
      );
      const data = await res.json();

      if (!data || !Array.isArray(data.x) || !Array.isArray(data.y) || data.x.length !== data.y.length) {
        console.error("스펙트럼 데이터 이상:", data);
        setSpectrum(null);
        return;
      }

      setSpectrum([data.x, data.y]);
      setHighlightRange([data.start, data.end]);
    } catch (err) {
      console.error("스펙트럼 fetch 실패:", err);
      setSpectrum(null);
    }
  };

  const handleLibrarySelect = async (file: string) => {
    try {
      const res = await fetch(
        `http://192.168.12.46:5000/library_data?filename=${encodeURIComponent(file)}`
      );
      const data = await res.json();

      if (!data || !Array.isArray(data.x) || !Array.isArray(data.y) || data.x.length !== data.y.length) {
        console.error("라이브러리 데이터 이상:", data);
        return;
      }

      setSelectedSimilar({
        file,
        combined: 0,
        x_original: data.x,
        y_original: data.y,
      });
    } catch (err) {
      console.error("라이브러리 fetch 실패:", err);
    }
  };

  // 🔹 유사도 분석 요청 및 chemical 주석 처리
  useEffect(() => {
    const fetchSimilarity = async () => {
      if (!spectrum || !selectedImage || selectedRow === null) return;

      setIsLoading(true);

      try {
        const res = await fetch("http://192.168.12.46:5000/similarity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: selectedImage, row: selectedRow }),
        });

        if (!res.ok) throw new Error(`Response: ${res.status}`);

        const json = await res.json();

        if (!json || !Array.isArray(json.top5) || !Array.isArray(json.library)) {
          console.error("유사도 데이터 이상:", json);
          setTop5List([]);
          setLibraryList([]);
          setSelectedSimilar(null);
          setIsLoading(false);
          return;
        }

        setTop5List(json.top5);
        setLibraryList(json.library);
        setSelectedSimilar(json.top5[0] || null);

        // 🔹 chemical 주석 세팅
        if (Array.isArray(json.chemicalData)) {
          const [xArr, _] = spectrum;
          const chartMaxX = Math.max(...xArr);
          const fontSize = 13;
          const yOffsetStep = 0.07;

          const lines = json.chemicalData.flatMap((item: any, idx: number) => {
            const targetX = item.wavenumber;
            let closestIdx = 0;
            let minDiff = Infinity;
            for (let i = 0; i < xArr.length; i++) {
              const diff = Math.abs(xArr[i] - targetX);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
              }
            }

            const matchedX = xArr[closestIdx];
            const total = json.chemicalData.length;
            const adjustedY = 0.94 - ((total - 1 - idx) * yOffsetStep);
            const label = item.formula.replaceAll('"', '');
            const textWidth = estimateTextWidth(label, fontSize);

            const overflow = matchedX + textWidth - chartMaxX;
            const xAdjust = overflow > 0 ? (-overflow - 5) / 3 : 0;

            return [
              {
                type: "line",
                borderColor: "rgba(0, 0, 0, 0.12)",
                borderWidth: 10,
                scaleID: "x",
                value: matchedX,
                drawTime: "afterDatasetsDraw",
              },
              {
                type: "label",
                xValue: matchedX,
                yValue: adjustedY,
                content: label,
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                font: { size: fontSize },
                xAdjust,
                yAdjust: -10,
                drawTime: "afterDatasetsDraw",
                callout: {
                  display: false
                },
              },
            ];
          });

          setAnnotations(lines);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("유사도 분석 실패:", err);
        setTop5List([]);
        setLibraryList([]);
        setSelectedSimilar(null);
        setIsLoading(false);
      }
    };

    fetchSimilarity();
  }, [spectrum, selectedImage, selectedRow]);


  return (
    <>
      {isLoading && <LoadingOverlay />}
      <div className="flex w-full h-[calc(100vh-80px)]">
        <div className="flex-[2] flex flex-col items-center pt-20 pl-10">
          <ImageToggleDropdown
            onSelect={(file) => {
              setIsLoading(true);
              setSelectedImage(file);
              setSelectedRow(null);
              setSpectrum(null);
              setTop5List([]);
              setLibraryList([]);
              setSelectedSimilar(null);
              setHighlightRange(null);
              setAnnotations([]);
            }}
          />
          <div className="w-[95%] h-[90%] mt-10 bg-gray-700 rounded-2xl flex justify-center items-center">
            <ImagePreview
              filename={selectedImage}
              onRowSelect={handleRowSelect}
              clickedRows={selectedRow !== null ? [selectedRow] : []}
              highlightRange={highlightRange ?? undefined}
              onLoadComplete={() => setIsLoading(false)}
            />
          </div>
        </div>

        <div className="flex-[3] flex flex-col items-center pt-20 pr-10">
          <div className="text-[clamp(14px,1.5vw,22px)] font-bold text-white mb-4">유사도 비교</div>

          <div className="w-[95%] h-[90%] mt-10 bg-gray-700 flex rounded-2xl">
            {top5List.length === 0 ? (
              <div className="flex w-full h-full items-center justify-center text-[clamp(8px,1vw,16px)] opacity-50">
                유사도 분석 결과가 없습니다.
              </div>
            ) : (
              <div className="flex flex-col w-full h-full">
                <div className="flex flex-row flex-[2]">
                  {/* Top5 */}
                  <div className="flex-1 p-5 text-sm max-h-[20vh] flex flex-col">
                    <div className="text-[clamp(14px,1.5vw,22px)] font-bold text-white mb-3">유사도 Top5</div>
                    <ul className="overflow-y-auto flex-1 space-y-2">
                      {top5List.map((item, index) => (
                        <li
                          key={index}
                          onClick={() => setSelectedSimilar(item)}
                          className={`cursor-pointer p-2 rounded-md hover:bg-gray-500 text-white ${selectedSimilar?.file === item.file ? "bg-gray-600 font-semibold" : ""}`}
                        >
                          {index + 1}. {item.file.replace(".csv", "")} — C: {item.combined.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Library */}
                  <div className="flex-1 p-5 text-sm max-h-[20vh] flex flex-col">
                    <div className="text-[clamp(14px,1.5vw,22px)] font-bold text-white mb-3">라이브러리</div>
                    <div className="overflow-y-auto flex-1 space-y-1">
                      {libraryList.map((file) => (
                        <div
                          key={file}
                          onClick={() => handleLibrarySelect(file)}
                          className={`cursor-pointer px-2 py-1 rounded hover:bg-gray-600 text-white ${selectedSimilar?.file === file ? "bg-gray-600 font-semibold" : ""}`}
                        >
                          {file.replace(".csv", "")}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


                {/* Graph */}
                {selectedSimilar && spectrum && (
                  <div className="flex-[8] min-h-0 mt-2">
                    <SimilaritySpectrumGraph
                      spectrum={spectrum}
                      x={selectedSimilar.x_original}
                      y={selectedSimilar.y_original}
                      myDataLabel={(selectedImage ?? "My Data").replace(".tiff", "")}
                      similarLabel={selectedSimilar.file.replace(".csv", "")}
                      annotations={annotations}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Measurement;
