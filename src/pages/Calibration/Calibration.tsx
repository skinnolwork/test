import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, Chart, registerables } from "chart.js";
import CalibrationList from "./CalibrationList";

ChartJS.register(...registerables);

const REAL_IMAGE_HEIGHT = 2160;

const Calibration: React.FC = () => {
    const [reloadKey, setReloadKey] = useState(0);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [spectrumData, setSpectrumData] = useState<{ x: number[]; y: number[] } | null>(null);
    const [selectedX, setSelectedX] = useState<number[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        setSelectedRows([]);
        setSpectrumData(null);
        setSelectedX([]);
    }, []);

    useEffect(() => {
        if (!chartRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d")!;
            const parentWidth = canvasRef.current.parentElement?.clientWidth ?? 800;

            const computeFontSizes = (w: number) => {
                const base = Math.max(12, Math.round(w / 50));
                return {
                    titleSize: base,
                    tickSize: Math.max(10, Math.round(base * 0.8))  // x, y 눈금
                };
            };

            let { titleSize, tickSize } = computeFontSizes(parentWidth);

            chartRef.current = new Chart(ctx, {
                type: "line",
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: "Spectrum",
                            data: [],
                            borderColor: "white",
                            pointRadius: 0,
                            borderWidth: 0.7,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    scales: {
                        x: {
                            type: "linear",
                            reverse: true,
                            title: { display: true, text: "Wavenumber (cm⁻¹)", color: "white", font: { size: titleSize } },
                            ticks: {
                                font: { size: tickSize },
                                color: '#fff',
                            },
                            grid: { color: 'rgba(255,255,255,0.3)' },
                        },
                        y: {
                            title: { display: true, text: "Intensity (Arb.)", color: "white", font: { size: titleSize } },
                            beginAtZero: true,
                            ticks: {
                                font: { size: tickSize },
                                color: '#fff',
                            },
                            grid: { color: 'rgba(255,255,255,0.3)' },
                        },
                    },
                    plugins: {
                        legend: { display: false },
                    },
                },
            });

            // 📏 resize 시에도 폰트 다시 계산
            const handleResize = () => {
                const w = canvasRef.current?.parentElement?.clientWidth ?? 800;
                const { titleSize, tickSize } = computeFontSizes(w);
                const chart = chartRef.current!;
                const xScale = chart.options.scales?.x;
                const yScale = chart.options.scales?.y;

                if (xScale && "title" in xScale && xScale.title?.font) {
                    (xScale.title.font as any).size = titleSize;
                }
                if (xScale?.ticks?.font) {
                    (xScale.ticks.font as any).size = tickSize;
                }

                if (yScale && "title" in yScale && yScale.title?.font) {
                    (yScale.title.font as any).size = titleSize;
                }
                if (yScale?.ticks?.font) {
                    (yScale.ticks.font as any).size = tickSize;
                }


                chart.update();
            };

            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }
    }, []);

    // 📌 Chart 클릭 이벤트
    useEffect(() => {
        if (!chartRef.current) return;

        const chart = chartRef.current;

        chart.options.onClick = (e) => {
            const points = chart.getElementsAtEventForMode(
                e as unknown as MouseEvent,
                "nearest",
                { intersect: false },
                false
            );

            if (points.length) {
                const idx = points[0].index;
                const xVal = (chart.data.labels as number[])[idx];
                setSelectedX((prev) => {
                    const next = [...prev, xVal];
                    if (next.length > 2) next.shift();
                    return next;
                });
            }
        };

        chart.update();
    }, [chartRef.current]);

    // 📡 데이터 fetch
    useEffect(() => {
        if (selectedRows.length !== 2) return;

        const interval = setInterval(async () => {
            try {
                let url = `http://192.168.12.46:5000/camera_spectrum?row1=${selectedRows[0]}&row2=${selectedRows[1]}`;

                if (selectedX.length === 2) {
                    const [x1, x2] = [...selectedX].sort((a, b) => a - b);
                    url += `&x_type=calibrated`;
                    url += `&x1=${x1}&x2=${x2}`;
                } else {
                    url += `&x_type=Calibration`;
                }

                const res = await fetch(url);
                const json = await res.json();
                setSpectrumData(json);
            } catch (err) {
                console.error("spectrum fetch 실패", err);
            }
        }, 300);

        return () => clearInterval(interval);
    }, [selectedRows, selectedX]);

    // 📊 데이터 들어오면 업데이트
    useEffect(() => {
        if (!chartRef.current || !spectrumData || !spectrumData.x || !spectrumData.y) return;

        if (spectrumData.x.length !== spectrumData.y.length || spectrumData.x.length === 0) {
            console.warn("잘못된 spectrumData:", spectrumData);
            chartRef.current.data.labels = [];
            chartRef.current.data.datasets[0].data = [];
            chartRef.current.update();
            return;
        }

        const reversedX = [...spectrumData.x].reverse();
        const reversedY = [...spectrumData.y].reverse();

        chartRef.current.data.labels = reversedX;
        chartRef.current.data.datasets[0].data = reversedX.map((x, i) => ({ x, y: reversedY[i] }));
        chartRef.current.options.scales!.x!.min = Math.min(...reversedX);
        chartRef.current.options.scales!.x!.max = Math.max(...reversedX);

        chartRef.current.update();
    }, [spectrumData]);

    // 📹 카메라 스트림
    useEffect(() => {
        let stop = false;
        const canvas = videoRef.current;
        const ctx = canvas?.getContext("2d");

        const startFrameLoop = async () => {
            while (!stop && canvas && ctx) {
                try {
                    const res = await fetch(`http://192.168.12.46:5000/camera/frame_jpg?${Date.now()}`);
                    const blob = await res.blob();
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    await new Promise((r) => (img.onload = r));
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                } catch (err) {
                    console.error("frame_jpg fetch 실패", err);
                }

                await new Promise((r) => setTimeout(r, 150));
            }
        };

        const waitForReady = async () => {
            try {
                await fetch("http://192.168.12.46:5000/camera/start");
                let ready = false;
                while (!ready) {
                    const res = await fetch("http://192.168.12.46:5000/camera/status");
                    const json = await res.json();
                    if (json.status === "ready") ready = true;
                    else await new Promise((r) => setTimeout(r, 200));
                }
                startFrameLoop();
            } catch (err) {
                console.error("카메라 준비 실패:", err);
            }
        };

        waitForReady();

        return () => {
            stop = true;
            fetch("http://192.168.12.46:5000/camera/close", { method: "POST" });
        };
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const boundingBox = container.getBoundingClientRect();
        const offsetY = e.clientY - boundingBox.top;
        const displayedHeight = boundingBox.height;
        const clickedRow = Math.round((offsetY / displayedHeight) * REAL_IMAGE_HEIGHT);

        if (selectedRows.length === 2) {
            setSelectedRows([]);
            setSpectrumData(null);
            setSelectedX([]);
            return;
        }

        setSelectedRows([...selectedRows, clickedRow]);
    };

    const handleSaveCalibration = async () => {
        if (!spectrumData || !spectrumData.x || spectrumData.x.length === 0) return;

        const x_start = Math.min(...spectrumData.x).toFixed(2);
        const x_end = Math.max(...spectrumData.x).toFixed(2);

        try {
            const res = await fetch("http://192.168.12.46:5000/save_calibration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ x_start, x_end }),
            });

            const json = await res.json();
            if (res.ok) {
                alert("저장 완료!");
                setReloadKey((prev) => prev + 1);
            } else {
                alert("저장 실패: " + json.error);
            }
        } catch (err) {
            console.error(err);
            alert("저장 중 오류 발생");
        }
    };

    return (
        <div className="flex w-full h-[calc(100vh-80px)] p-20">
            <CalibrationList reloadKey={reloadKey} />
            <div className="flex-col flex-1 h-[100%] mt-5">
                <div className="relative w-[95%] h-[50%] bg-black mb-4 mx-auto rounded-2xl">
                    <canvas ref={videoRef} width={256} height={144} className="w-full h-full" />
                    <div className="absolute inset-0 z-10 cursor-crosshair" onClick={handleClick} />
                    {selectedRows.map((realRow, index) => {
                        const displayRow = Math.round(
                            (realRow / REAL_IMAGE_HEIGHT) * (videoRef.current?.getBoundingClientRect().height || 1)
                        );
                        return (
                            <div
                                key={index}
                                className="absolute w-full border-t-2 border-green-400"
                                style={{ top: `${displayRow}px` }}
                            />
                        );
                    })}
                </div>

                <div className="bg-gray-700 p-4 rounded-2xl" style={{ height: "45%", width: "95%", margin: "0 auto" }}>
                    <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
                </div>

                <div className="flex justify-center mt-5 gap-4">
                    <button
                        className="bg-red-600 px-4 py-2 rounded"
                        onClick={() => setSelectedX([])}
                    >
                        취소
                    </button>
                    <button
                        className="bg-green-600 px-4 py-2 rounded"
                        disabled={selectedX.length !== 2}
                        onClick={handleSaveCalibration}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Calibration;
