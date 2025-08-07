import React, { useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  annotationPlugin
);

interface Section {
  id: number;
  x: number[];
  y: number[];
}

interface Props {
  sections: Section[];
  mode: "curve" | "ratio";
  ratios?: number[];
  onFinishSelect?: (points: number[]) => void;
  xPoints?: number[];
}

const IntegrationGraph: React.FC<Props> = ({
  sections,
  mode,
  ratios,
  onFinishSelect,
  xPoints = [],
}) => {
  const chartRef = useRef<any>(null);
  const [internalPoints, setInternalPoints] = useState<number[]>([]);
  const points = xPoints.length ? xPoints : internalPoints;

  const datasets: any[] = [];
  const baseHue = 0;

  const N = sections.length;
  const r = 0.15;
  const actualScale = 1 / (1 + (N - 1) * r);
  const baseStep = actualScale * r;

  if (mode === "curve") {
    sections.forEach((section, idx) => {
      if (!section.x || !section.y || section.x.length !== section.y.length) return;

      const yMin = Math.min(...section.y);
      const yMax = Math.max(...section.y);
      const normalizedY = section.y.map(v => (v - yMin) / (yMax - yMin || 1));
      const offset = (N - 1 - idx) * baseStep;

      const mainData = section.x.map((x, i) => ({
        x,
        y: normalizedY[i] * actualScale + offset,
      }));

      datasets.push({
        label: `curve-${idx}`,
        data: mainData,
        borderColor: `hsl(0, 50%, ${30 + (idx / N) * 50}%)`,
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      });
    });
  }

  if (mode === "ratio" && ratios) {
    const pointsData = ratios.map((r, idx) => {
      const lightness = 30 + ((ratios.length - 1 - idx) / ratios.length) * 50;
      const color = `hsl(${baseHue}, 50%, ${lightness}%)`;
      return {
        x: r,
        y: idx + 0.5,
        color,
      };
    });

    const screenWidth = window.innerWidth;
    const pointSize = Math.max(2, Math.min(7, Math.round(screenWidth / 300)));


    datasets.push({
      label: "Ratios",
      type: "line",
      data: pointsData,
      borderColor: "white",
      borderWidth: 0.5,
      pointRadius: pointSize,
      pointHoverRadius: 7,
      showLine: true,
      pointBackgroundColor: pointsData.map(p => p.color),
      pointBorderColor: pointsData.map(p => p.color),
    });
  }

  const allX = sections.flatMap(s => s.x);
  const computedXMin = allX.length > 0 ? Math.min(...allX) : 0;
  const computedXMax = allX.length > 0 ? Math.max(...allX) : 1;

  let xMin = mode === "curve" ? computedXMin : 0;
  let xMax = mode === "curve" ? computedXMax : 1;

  if (mode === "ratio" && ratios && ratios.length > 0) {
    const ratioMin = Math.min(...ratios);
    const ratioMax = Math.max(...ratios);

    const range = ratioMax - ratioMin || 1;
    const padding = range * 0.05;

    xMin = ratioMin - padding;
    xMax = ratioMax + padding;
  }

  const data = { datasets };

  const annotations: any = {};

  // 선 4개
  points.forEach((x, i) => {
    const color =
      i < 2
        ? "rgba(0, 255, 0, 0.5)"
        : "rgba(255, 165, 0, 0.5)";

    annotations[`line${i + 1}`] = {
      type: "line",
      xMin: x,
      xMax: x,
      borderColor: color,
      borderWidth: 2,
    };
  });

  // 적분 구간 채우기
  if (points.length >= 2) {
    annotations["fill1"] = {
      type: "box",
      xMin: Math.min(points[0], points[1]),
      xMax: Math.max(points[0], points[1]),
      yMin: 0,
      yMax: mode === "curve" ? 1 : ratios?.length ?? 1,
      backgroundColor: "rgba(0, 255, 0, 0.05)",
      borderWidth: 0,
    };
  }

  if (points.length >= 4) {
    annotations["fill2"] = {
      type: "box",
      xMin: Math.min(points[2], points[3]),
      xMax: Math.max(points[2], points[3]),
      yMin: 0,
      yMax: mode === "curve" ? 1 : ratios?.length ?? 1,
      backgroundColor: "rgba(255, 165, 0, 0.1)",
      borderWidth: 0,
    };
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      annotation: { annotations },
    },
    scales: {
      x: {
        type: "linear",
        min: xMin,
        max: xMax,
        ticks: {
          callback: (value) => {
            if (typeof value === 'number') return value.toFixed(0);
            return value;
          },
          font: { size: 10 },
          color: '#fff',
        },
        grid: { color: 'rgba(255,255,255,0.3)' },
        title: {
          display: true,
          text: mode === "curve" ? "Wavenumber (cm⁻¹)" : "Ratio",
          color: '#fff',
          font: {
            size: 14,
          },
        },
      },
      y: {
        ticks: { display: false },
        grid: { color: 'rgba(255,255,255,0.3)' },
      },
    },
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current;
    if (!chart) return;

    const canvas = chart.canvas;
    const rect = canvas.getBoundingClientRect();
    const xPixel = event.clientX - rect.left;

    const xScale = chart.scales.x;
    const xValue = xScale.getValueForPixel(xPixel);

    let updated = [...internalPoints, xValue];
    if (updated.length > 4) updated = [xValue];

    setInternalPoints(updated);

    if (updated.length === 4 && onFinishSelect) {
      onFinishSelect(updated);
    }
  };

  return (
    <div className="w-full h-full p-5">
      <Line
        ref={chartRef}
        data={data}
        options={options}
        onClick={handleClick}
      />
    </div>
  );
};

export default IntegrationGraph;
