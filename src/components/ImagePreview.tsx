import React, { useEffect, useState, useRef, useLayoutEffect } from "react";

interface Props {
  filename: string | null;
  onRowSelect?: (row: number) => void;
  clickedRows?: number[];
  isResetting?: boolean;
  highlightRange?: [number, number];
  onLoadComplete?: () => void;
}

const ImagePreview: React.FC<Props> = ({
  filename,
  onRowSelect,
  isResetting,
  highlightRange,
  onLoadComplete,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const realImageHeight = 2160;
  const [calibrationRange, setCalibrationRange] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!filename) return;

    const fetchImage = async () => {
      try {
        const res = await fetch(
          `http://192.168.12.46:5000/processed-image?filename=${filename}`
        );
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
      } catch (err) {
        console.error("이미지 불러오기 실패:", err);
        setImageSrc(null);
      }
    };
    fetchImage();
  }, [filename]);

  useLayoutEffect(() => {
    if (imageRef.current) {
      setImageHeight(imageRef.current.clientHeight);
    }
  }, [imageSrc]);

  useEffect(() => {
    fetch("http://192.168.12.46:5000/calibration_range")
      .then((res) => res.json())
      .then((data) => setCalibrationRange([data.start, data.end]))
      .catch(() => setCalibrationRange(null));
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!filename || isResetting || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const row = Math.round((y / rect.height) * realImageHeight);

    onRowSelect?.(row);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {imageSrc ? (
        <>
          <img
            ref={imageRef}
            src={imageSrc}
            alt="전처리된 이미지"
            onLoad={onLoadComplete}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill",
              cursor: "crosshair",
            }}
            onClick={handleClick}
          />

          {highlightRange && imageHeight > 0 && (
            <div
              style={{
                position: "absolute",
                top: `${(highlightRange[0] / realImageHeight) * imageHeight}px`,
                height: `${((highlightRange[1] - highlightRange[0]) / realImageHeight) * imageHeight}px`,
                left: 0,
                width: "100%",
                backgroundColor: "rgba(0, 255, 0, 0.2)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* ✅ 눈금선 + 숫자 라벨 (좌우 짤림 보정 포함) */}
          {calibrationRange && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "40px",
                pointerEvents: "none",
              }}
            >
              {[...Array(10)].map((_, i) => {
                const [xStart, xEnd] = calibrationRange;
                const value = xEnd - ((xEnd - xStart) * i) / 9;
                const percent = (i / 9) * 100;

                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${percent}%`,
                      bottom: "0px",
                      width: "1px",
                      height: "10px",
                      backgroundColor: "lime",
                      transform: "translateX(-0.5px)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-18px",
                        ...(i === 0
                          ? { left: 0, transform: "none", textAlign: "left" }
                          : i === 9
                          ? { right: 0, left: "auto", transform: "none", textAlign: "right" }
                          : { left: "50%", transform: "translateX(-50%)", textAlign: "center" }),
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "lime",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {value.toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="text-[clamp(8px,1vw,16px)] opacity-50">
          이미지를 선택하세요.
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
