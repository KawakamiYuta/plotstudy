import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function WaveformBarChart({
  data,
  width = 600,
  height = 300,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((_, i) => i))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([d3.min(data), d3.max(data)])
      .nice()
      .range([innerHeight, 0]);

    ctx.save();
    ctx.translate(margin.left, margin.top);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    // ===== 軸線 =====
    ctx.beginPath();
    ctx.moveTo(0, innerHeight);
    ctx.lineTo(innerWidth, innerHeight); // X軸
    ctx.moveTo(0, 0);
    ctx.lineTo(0, innerHeight); // Y軸
    ctx.stroke();

    // ===== X軸 目盛り =====
    const xTickCount = 10;
    const xTickValues = x.domain().filter(
      (_, i) => i % Math.ceil(data.length / xTickCount) === 0
    );

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    xTickValues.forEach((i) => {
      const px = x(i) + x.bandwidth() / 2;

      // 目盛り線
      ctx.beginPath();
      ctx.moveTo(px, innerHeight);
      ctx.lineTo(px, innerHeight + 5);
      ctx.stroke();

      // ラベル
      ctx.fillText(i, px, innerHeight + 8);
    });

    // ===== Y軸 目盛り =====
    const yTicks = y.ticks(5);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    yTicks.forEach((tick) => {
      const py = y(tick);

      // 目盛り線
      ctx.beginPath();
      ctx.moveTo(-5, py);
      ctx.lineTo(0, py);
      ctx.stroke();

      // ラベル
      ctx.fillText(tick.toFixed(2), -8, py);
    });

    // ===== ゼロライン =====
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(0, y(0));
    ctx.lineTo(innerWidth, y(0));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#000";

    // ===== 棒描画 =====
    data.forEach((d, i) => {
      const barX = x(i);
      const barWidth = x.bandwidth();
      const barY = d >= 0 ? y(d) : y(0);
      const barHeight = Math.abs(y(d) - y(0));

      ctx.fillStyle = d >= 0 ? "#4e79a7" : "#e15759";
      ctx.fillRect(barX, barY, barWidth, barHeight);
    });

    ctx.restore();
  }, [data, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
