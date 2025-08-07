import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import LoadingOverlay from "../../components/LoadingOverlay";


Chart.register(...registerables);

const responsiveFontPlugin = {
  id: "responsiveFontPlugin",
  afterLayout(chart: {
    width: number;
    options: {
      scales: {
        x: { title: { font: { size: number } }, ticks: { font?: { size: number } } };
        y: { title: { font: { size: number } }, ticks: { font?: { size: number } } };
      };
    };
  }) {
    const width = chart.width;

    const titleSize = Math.min(Math.max(width / 100, 12), 20);
    const tickSize = Math.min(Math.max(width / 120, 10), 16);

    if (chart.options.scales?.x?.title?.font) {
      chart.options.scales.x.title.font.size = titleSize;
    }
    if (chart.options.scales?.x?.ticks) {
      chart.options.scales.x.ticks.font = { size: tickSize };
    }

    if (chart.options.scales?.y?.title?.font) {
      chart.options.scales.y.title.font.size = titleSize;
    }
    if (chart.options.scales?.y?.ticks) {
      chart.options.scales.y.ticks.font = { size: tickSize };
    }
  },
};

Chart.register(responsiveFontPlugin);

const REAL_IMAGE_HEIGHT = 2160;

const SpectrumGraph = ({ data }: { data: { x: number[]; y: number[] } | null }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d")!;
    if (chartRef.current) chartRef.current.destroy();

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
            title: {
              display: true,
              text: "Wavenumber (cm⁻¹)",
              color: "white",
              font: { size: 12 },
            },
            ticks: { color: "white" },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
          y: {
            title: {
              display: true,
              text: "Intensity (Arb.)",
              color: "white",
              font: { size: 12 },
            },
            ticks: { color: "white" },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (
      !data ||
      !Array.isArray(data.x) ||
      !Array.isArray(data.y) ||
      data.x.length === 0 ||
      data.y.length === 0 ||
      data.x.length !== data.y.length
    ) {
      console.warn("Invalid spectrum data", data);
      chartRef.current.data.labels = [];
      chartRef.current.data.datasets[0].data = [];
      chartRef.current.update();
      return;
    }

    let { x, y } = data;

    if (x[0] > x[x.length - 1]) {
      x = [...x].reverse();
      y = [...y].reverse();
    }

    chartRef.current.data.labels = x;
    chartRef.current.data.datasets[0].data = x.map((v, i) => ({ x: v, y: y[i] }));

    chartRef.current.options.scales!.x!.min = Math.min(...x);
    chartRef.current.options.scales!.x!.max = Math.max(...x);

    chartRef.current.options.scales!.y!.min = 0;
    chartRef.current.options.scales!.y!.max = Math.max(...y);

    chartRef.current.update();
  }, [data]);

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

const SurveyScan = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [spectrumData, setSpectrumData] = useState<{ x: number[]; y: number[] } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    let stop = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const startFrameLoop = async () => {
      while (!stop && canvas && ctx) {
        try {
          const [frameRes, captureRes] = await Promise.all([
            fetch("http://192.168.12.46:5000/camera/frame_jpg?" + Date.now()),
            fetch("http://192.168.12.46:5000/camera/capturing-status"),
          ]);

          const blob = await frameRes.blob();
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          await new Promise((res) => (img.onload = res));
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const captureJson = await captureRes.json();
          setIsCapturing(captureJson?.capturing === true);
        } catch (err) {
          console.error("frame_jpg 또는 capturing-status fetch 실패", err);
        }

        await new Promise((res) => setTimeout(res, 150));
      }
    };

    const waitForReady = async () => {
      await fetch("http://192.168.12.46:5000/camera/start");

      let ready = false;
      while (!ready) {
        const res = await fetch("http://192.168.12.46:5000/camera/status");
        const json = await res.json();

        if (json.status === "ready") {
          ready = true;
        } else {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      startFrameLoop();
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
      return;
    }

    const newRows = [...selectedRows, clickedRow];
    setSelectedRows(newRows);

    if (newRows.length === 2) {
      fetch(`http://192.168.12.46:5000/spectrum?row1=${newRows[0]}&row2=${newRows[1]}`)
        .then((res) => res.json())
        .then((json) => {
          if (
            json &&
            Array.isArray(json.x) &&
            Array.isArray(json.y) &&
            json.x.length > 0 &&
            json.y.length > 0 &&
            json.x.length === json.y.length
          ) {
            setSpectrumData(json);
          } else {
            console.warn("Invalid spectrum response", json);
            setSpectrumData(null);
          }
        })
        .catch((err) => {
          console.error("spectrum fetch 실패", err);
          setSpectrumData(null);
        });
    }
  };

  useEffect(() => {
    if (selectedRows.length === 2) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(
            `http://192.168.12.46:5000/camera_spectrum?row1=${selectedRows[0]}&row2=${selectedRows[1]}`
          );
          const json = await res.json();
          if (
            json &&
            Array.isArray(json.x) &&
            Array.isArray(json.y) &&
            json.x.length > 0 &&
            json.y.length > 0 &&
            json.x.length === json.y.length
          ) {
            setSpectrumData(json);
          } else {
            console.warn("Invalid spectrum response (live)", json);
            setSpectrumData(null);
          }
        } catch (err) {
          console.error("실시간 spectrum fetch 실패", err);
          setSpectrumData(null);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [selectedRows]);

  return (
    <div className="p-10 justify-center w-full h-[calc(100vh-80px)] mx-auto mt-10">
      <div className="relative w-[90%] h-[45%] bg-black mb-4 mx-auto rounded-2xl">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full absolute z-0"
        />
        {isCapturing && <LoadingOverlay />}
        <div className="absolute inset-0 z-10 cursor-crosshair" onClick={handleClick} />

        {selectedRows.map((realRow, index) => {
          const actualCanvasHeight =
            canvasRef.current?.getBoundingClientRect().height || 1;

          const displayRow = Math.round(
            (realRow / REAL_IMAGE_HEIGHT) * actualCanvasHeight
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

      <div className="relative flex-[1] w-[90%] bg-gray-700 h-[45%] p-4 rounded-2xl shadow mx-auto">
        {spectrumData && selectedRows.length === 2 ? (
          <SpectrumGraph data={spectrumData} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white opacity-50">
            데이터를 선택해주세요
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyScan;
