import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";


Chart.register(annotationPlugin);
Chart.register(...registerables);

// 📌 반응형 폰트 플러그인
const responsiveFontPlugin = {
  id: "responsiveFontPlugin",
  afterLayout(chart: {
    width: number;
    options: {
      plugins: any;
      scales: {
        x: { title: { font: { size: number } }, ticks: { font?: { size: number } } };
        y: { title: { font: { size: number } }, ticks: { font?: { size: number } } };
      };
    };
  }) {
    const w = chart.width;

    const titleSize = Math.min(Math.max(w / 50, 12), 20);
    const tickSize = Math.min(Math.max(w / 70, 8), 14);
    const legendSize = Math.min(Math.max(w / 70, 8), 20);

    if (chart.options.scales?.x?.title?.font) {
      chart.options.scales.x.title.font.size = titleSize;
    }
    if (chart.options.scales?.y?.title?.font) {
      chart.options.scales.y.title.font.size = titleSize;
    }
    if (chart.options.scales?.x?.ticks?.font) {
      chart.options.scales.x.ticks.font.size = tickSize;
    }
    if (chart.options.scales?.y?.ticks?.font) {
      chart.options.scales.y.ticks.font.size = tickSize;
    }
    if (chart.options.plugins?.legend?.labels?.font) {
      chart.options.plugins.legend.labels.font.size = legendSize;
    }
  },
};

Chart.register(responsiveFontPlugin);

interface Props {
  spectrum: [number[], number[]];
  x: number[];
  y: number[];
  myDataLabel: string;
  similarLabel: string;
  annotations: any[];
}

function interpolate(x: number[], y: number[], newX: number[]): (number | null)[] {
  return newX.map(x0 => {
    if (x0 < x[0] || x0 > x[x.length - 1]) return null; // ✅ 여기 null로
    let i = 0;
    while (x[i + 1] < x0) i++;
    const x1 = x[i], x2 = x[i + 1];
    const y1 = y[i], y2 = y[i + 1];
    return y1 + ((y2 - y1) * (x0 - x1)) / (x2 - x1);
  });
}


const SimilaritySpectrumGraph: React.FC<Props> = ({ spectrum, x, y, myDataLabel, similarLabel, annotations }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d")!;

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: myDataLabel,
            data: [],
            borderColor: "blue",
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: similarLabel,
            data: x.map((xVal, i) => ({
              x: xVal,
              y: y[i] ?? null, // null 처리
            })),
            borderColor: "red",
            pointRadius: 0,
            borderWidth: 1,
            spanGaps: false,
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
            title: {
              display: true,
              text: "Wavenumber (cm⁻¹)",
              color: "white",
              font: { size: 15 },
            },
            ticks: {
              color: "white",
              font: { size: 15 },
            },
            grid: {
              color: "rgba(255,255,255,0.1)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Intensity (Arb.)",
              color: "white",
              font: { size: 15 },
            },
            ticks: {
              color: "white",
              font: { size: 15 },
            },
            grid: {
              color: "rgba(255,255,255,0.1)",
            },
          },
        },
        plugins: {
          tooltip: {
            enabled: false
          },
          legend: {
            labels: {
              color: "white",
              font: { size: 14 },
            },
          },
          annotation: {
            annotations: annotations || [],
          },
        },
      },
    });
  }, [myDataLabel, similarLabel, annotations]);

  useEffect(() => {
    if (!chartRef.current || !annotations) return;

    chartRef.current.options.plugins!.annotation!.annotations = annotations;
    chartRef.current.update();
  }, [annotations]);


  useEffect(() => {
    if (!chartRef.current || !spectrum || !Array.isArray(x) || !Array.isArray(y)) return;

    let [xMy, yMy] = spectrum;
    if (xMy.length !== yMy.length || x.length !== y.length) {
      console.warn("데이터 길이 불일치");
      return;
    }

    if (xMy[0] > xMy[xMy.length - 1]) {
      xMy = [...xMy].reverse();
      yMy = [...yMy].reverse();
    }

    const zippedSim = x.map((x0, i) => ({ x: x0, y: y[i] }))
      .sort((a, b) => a.x - b.x);
    const xSimSorted = zippedSim.map(p => p.x);
    const ySimSorted = zippedSim.map(p => p.y);

    const ySimInterp = interpolate(xSimSorted, ySimSorted, xMy);

    const chart = chartRef.current;

    chart.data.labels = xMy;
    chart.data.datasets[0].data = xMy.map((x, i) => ({ x, y: yMy[i] }));
    chart.data.datasets[1].data = xMy.map((x, i) => {
      const yVal = ySimInterp[i];
      return yVal !== null ? { x, y: yVal } : null;
    }).filter((point): point is { x: number; y: number } => point !== null);


    chart.options.scales!.x!.min = Math.min(...xMy);
    chart.options.scales!.x!.max = Math.max(...xMy);
    chart.options.scales!.y!.min = 0;
    chart.options.scales!.y!.max = Math.max(...yMy, ...ySimInterp.filter((v): v is number => v !== null));

    chart.update();
  }, [spectrum, x, y, myDataLabel, similarLabel]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
};

export default SimilaritySpectrumGraph;