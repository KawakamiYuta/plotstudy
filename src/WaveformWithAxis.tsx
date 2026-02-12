import React, { useEffect, useRef } from "react";
import { FrameData, frameStore } from "./frameStore";

// const WIDTH = 800;
// const HEIGHT = 720;

const MARGIN = {
    left: 60,
    right: 20,
    top: 20,
    bottom: 40,
};

// const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
// const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
// const WAVE_HEIGHT = INNER_HEIGHT*0.475;
// const FFT_HEIGHT = INNER_HEIGHT*0.475;
// const MARGIN_HEIGHT = INNER_HEIGHT*0.05;

function drawSpectrum(
    ctx: CanvasRenderingContext2D,
    spectrum: number[],
    offsetY: number,
    height: number,
    INNER_WIDTH: number
) {
    if (!spectrum.length) return;

    const MAX_DB = 256; // 適宜調整
    const barWidth = INNER_WIDTH / spectrum.length;

    ctx.fillStyle = "#f28e2b";

    for (let i = 0; i < spectrum.length; i++) {
        const value = spectrum[i];

        // dBなら正規化
        const normalized = Math.max(0, value) / MAX_DB;

        const barHeight = normalized * height;
        const x = i * barWidth;
        const y = offsetY + (height - barHeight);

        ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
}

function drawWave(ctx: CanvasRenderingContext2D, samples: number[], INNER_WIDTH: number, WAVE_HEIGHT: number) {
    if (samples.length === 0) return;

    const MAX_VALUE = 256;
    const step = Math.ceil(samples.length / INNER_WIDTH);

    ctx.beginPath();

    let first = true;
    let xIndex = 0;

    for (let i = 0; i < samples.length; i += step) {
        const x = xIndex++;
        const y = WAVE_HEIGHT * (1 - samples[i] / MAX_VALUE);

        if (first) {
            ctx.moveTo(x, y);
            first = false;
        } else {
            ctx.lineTo(x, y);
        }
    }

    // 🔥 下端まで閉じる
    ctx.lineTo(xIndex - 1, WAVE_HEIGHT); // 右下
    ctx.lineTo(0, WAVE_HEIGHT);          // 左下
    ctx.closePath();

    // 塗り
    ctx.fillStyle = "rgba(78,121,167,0.4)";
    ctx.fill();

    // 線を上に重ねる
    ctx.strokeStyle = "#4e79a7";
    ctx.lineWidth = 1;
    ctx.stroke();
}


function drawGrid(ctx: CanvasRenderingContext2D, INNER_WIDTH: number, WAVE_HEIGHT: number) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();

    // 横グリッド（0〜1）
    for (let i = 0; i <= 5; i++) {
        const y = (WAVE_HEIGHT / 5) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(INNER_WIDTH, y);
    }

    // 縦グリッド
    for (let i = 0; i <= 10; i++) {
        const x = (INNER_WIDTH / 10) * i;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WAVE_HEIGHT);
    }

    ctx.stroke();

    ctx.strokeStyle = "#888";
    ctx.strokeRect(0, 0, INNER_WIDTH, WAVE_HEIGHT);
}

function drawAxisLabels(
    ctx: CanvasRenderingContext2D,
    sampleCount: number,
    INNER_WIDTH: number,
    WAVE_HEIGHT: number
) {
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Y軸（0〜256）
    for (let i = 0; i <= 4; i++) {
        const value = 256 - (256 / 4) * i;
        const y =
            MARGIN.top + (WAVE_HEIGHT / 4) * i;

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
            MARGIN.top + WAVE_HEIGHT + 5
        );
    }
}

export default function WaveformWithAxis() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

useEffect(() => {
  const canvas = canvasRef.current!
  const ctx = canvas.getContext("2d")!
  ctxRef.current = ctx

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  resize()

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)

  return () => observer.disconnect()
}, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        ctxRef.current = canvas.getContext("2d");

        const draw = (frame: FrameData) => {
            const canvas = canvasRef.current!
            const ctx = ctxRef.current!
            if (!ctx) return

            const width = canvas.width
            const height = canvas.height

            const innerWidth = width - MARGIN.left - MARGIN.right
            const innerHeight = height - MARGIN.top - MARGIN.bottom

            const waveHeight = innerHeight * 0.475
            const fftHeight = innerHeight * 0.475
            const marginHeight = innerHeight * 0.05

            ctx.clearRect(0, 0, width, height)

            ctx.fillStyle = "black"
            ctx.fillRect(0, 0, width, height)

            ctx.save()
            ctx.translate(MARGIN.left, MARGIN.top)

            drawGrid(ctx, innerWidth, waveHeight)
            drawWave(ctx, frame.samples, innerWidth, waveHeight)

            drawFftGrid(ctx, innerWidth, waveHeight, marginHeight, fftHeight)
            drawSpectrum(
                ctx,
                frame.spectrum,
                waveHeight + marginHeight,
                fftHeight,
                innerWidth
            )

            ctx.restore()

            drawAxisLabels(ctx, frame.samples.length, innerWidth, waveHeight)
            drawFftAxisLabels(ctx, frame.spectrum.length, innerWidth, waveHeight, marginHeight, fftHeight)
        }



        const unsubscribe = frameStore.subscribe(draw);
        return () => unsubscribe();
    }, []);

    // return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />;
    return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

// FFTエリア用グリッド描画
function drawFftGrid(ctx: CanvasRenderingContext2D, INNER_WIDTH: number, WAVE_HEIGHT: number, MARGIN_HEIGHT: number, FFT_HEIGHT: number) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();

    // 横グリッド（0〜1）
    for (let i = 0; i <= 5; i++) {
        const y = WAVE_HEIGHT + MARGIN_HEIGHT + (FFT_HEIGHT / 5) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(INNER_WIDTH, y);
    }

    // 縦グリッド
    for (let i = 0; i <= 10; i++) {
        const x = (INNER_WIDTH / 10) * i;
        ctx.moveTo(x, WAVE_HEIGHT);
        ctx.lineTo(x, WAVE_HEIGHT + MARGIN_HEIGHT + FFT_HEIGHT);
    }

    ctx.stroke();
    ctx.strokeStyle = "#888";
    ctx.strokeRect(0, WAVE_HEIGHT + MARGIN_HEIGHT, INNER_WIDTH, FFT_HEIGHT);
}

// FFTエリア用軸ラベル描画
function drawFftAxisLabels(ctx: CanvasRenderingContext2D, spectrumLength: number, INNER_WIDTH: number, WAVE_HEIGHT: number, MARGIN_HEIGHT: number, FFT_HEIGHT: number) {
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Y軸（dB 0〜MAX_DB）
    const MAX_DB = 256;
    for (let i = 0; i <= 4; i++) {
        const value = MAX_DB - (MAX_DB / 4) * i;
        const y = MARGIN.top + WAVE_HEIGHT + MARGIN_HEIGHT + (FFT_HEIGHT / 4) * i;
        ctx.fillText(value.toFixed(0), MARGIN.left - 10, y);
    }

    // X軸
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= 10; i++) {
        const ratio = i / 10;
        const freqIndex = Math.floor(spectrumLength * ratio);
        const x = MARGIN.left + INNER_WIDTH * ratio;
        ctx.fillText(freqIndex.toString(), x, MARGIN.top + WAVE_HEIGHT + MARGIN_HEIGHT + FFT_HEIGHT + 5);
    }
}

