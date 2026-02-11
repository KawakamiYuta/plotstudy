import React, { useEffect, useRef } from "react";
import { frameStore } from "./frameStore";

const WIDTH = 800;
const HEIGHT = 500;

const MARGIN = {
  left: 60,
  right: 20,
  top: 20,
  bottom: 40,
};

const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

function drawWave(ctx: CanvasRenderingContext2D, samples: number[]) {
  if (samples.length === 0) return;

  const MAX_VALUE = 256;
  const step = Math.ceil(samples.length / INNER_WIDTH);

  ctx.beginPath();

  let first = true;
  let xIndex = 0;

  for (let i = 0; i < samples.length; i += step) {
    const x = xIndex++;
    const y = INNER_HEIGHT * (1 - samples[i] / MAX_VALUE);

    if (first) {
      ctx.moveTo(x, y);
      first = false;
    } else {
      ctx.lineTo(x, y);
    }
  }

  // 🔥 下端まで閉じる
  ctx.lineTo(xIndex - 1, INNER_HEIGHT); // 右下
  ctx.lineTo(0, INNER_HEIGHT);          // 左下
  ctx.closePath();

  // 塗り
  ctx.fillStyle = "rgba(78,121,167,0.4)";
  ctx.fill();

  // 線を上に重ねる
  ctx.strokeStyle = "#4e79a7";
  ctx.lineWidth = 1;
  ctx.stroke();
}


function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.beginPath();

  // 横グリッド（0〜1）
  for (let i = 0; i <= 5; i++) {
    const y = (INNER_HEIGHT / 5) * i;
    ctx.moveTo(0, y);
    ctx.lineTo(INNER_WIDTH, y);
  }

  // 縦グリッド
  for (let i = 0; i <= 10; i++) {
    const x = (INNER_WIDTH / 10) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, INNER_HEIGHT);
  }

  ctx.stroke();

  ctx.strokeStyle = "#888";
  ctx.strokeRect(0, 0, INNER_WIDTH, INNER_HEIGHT);
}

function drawAxisLabels(
  ctx: CanvasRenderingContext2D,
  sampleCount: number
) {
  ctx.fillStyle = "white";
  ctx.font = "12px monospace";

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

// Y軸（0〜256）
for (let i = 0; i <= 4; i++) {
  const value = 256 - (256 / 4) * i;
  const y =
    MARGIN.top + (INNER_HEIGHT / 4) * i;

  ctx.fillText(
    value.toFixed(0),
    MARGIN.left - 10,
    y
  );
}

  // X軸
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = 0; i <= 10; i++) {
    const ratio = i / 10;
    const sampleIndex = Math.floor(
      sampleCount * ratio
    );

    const x =
      MARGIN.left + INNER_WIDTH * ratio;

    ctx.fillText(
      sampleIndex.toString(),
      x,
      MARGIN.top + INNER_HEIGHT + 5
    );
  }
}

export default function WaveformWithAxis() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d");

const draw = (samples: number[]) => {
  const ctx = ctxRef.current;
  if (!ctx) return;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // 背景
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.translate(MARGIN.left, MARGIN.top);

  drawGrid(ctx);
  drawWave(ctx, samples);

  ctx.restore();
  drawAxisLabels(ctx, samples.length);
};


    const unsubscribe = frameStore.subscribe(draw);
    return () => unsubscribe();
  }, []);

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />;
}
