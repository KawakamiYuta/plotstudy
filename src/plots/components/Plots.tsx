import React, { useEffect, useRef, useState } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useViewport } from "../hooks/useViewport";
import { FrameData, frameStore } from "../models/frameStore";
import { renderFrame } from "../renderer/renderFrame";
// import { FrameData, frameStore } from "./frameStore";

// const WIDTH = 800;
// const HEIGHT = 720;



// const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
// const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
// const WAVE_HEIGHT = INNER_HEIGHT*0.475;
// const FFT_HEIGHT = INNER_HEIGHT*0.475;
// const MARGIN_HEIGHT = INNER_HEIGHT*0.05;

export default function WaveformWithAxis() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useCanvas(canvasRef);
    const viewport = useViewport();
    const latestFrame = useRef<FrameData | null>(null)

    useEffect(() => {
        const unsubscribe = frameStore.subscribe((frame) => {
            latestFrame.current = frame;
            draw();
        });
        return () => unsubscribe();
    }, []);

    const draw = () => {
        if (!latestFrame.current) return
        if (!ctxRef.current) return
        if (!canvasRef.current) return

        renderFrame(
            ctxRef.current,
            canvasRef.current,
            latestFrame.current,
            viewport
        )
    }

    useEffect(draw, [viewport.zoom, viewport.offset])
//     const [zoom, setZoom] = useState(1);      // 1 = 全体表示
//     const [offset, setOffset] = useState(0);  // 表示開始サンプル位置
//     const isDragging = useRef(false);
//     const lastX = useRef(0);
//     const ctxRef = useRef<CanvasRenderingContext2D | null>(null);


    // useEffect(() => {
    //     const canvas = canvasRef.current!

    //     const down = (e: MouseEvent) => {
    //         isDragging.current = true
    //         lastX.current = e.clientX
    //     }

    //     const move = (e: MouseEvent) => {
    //         if (!isDragging.current) return

    //         const dx = e.clientX - lastX.current
    //         lastX.current = e.clientX

    //         setOffset(prev => prev - dx * zoom)
    //     }

    //     const up = () => {
    //         isDragging.current = false
    //     }

    //     canvas.addEventListener("mousedown", down)
    //     window.addEventListener("mousemove", move)
    //     window.addEventListener("mouseup", up)

    //     return () => {
    //         canvas.removeEventListener("mousedown", down)
    //         window.removeEventListener("mousemove", move)
    //         window.removeEventListener("mouseup", up)
    //     }
    // }, [zoom]);
    // useEffect(() => {
    //     const canvas = canvasRef.current!

    //     const handleWheel = (e: WheelEvent) => {
    //         e.preventDefault()

    //         setZoom(prev => {
    //             const next = e.deltaY < 0 ? prev * 1.1 : prev / 1.1
    //             return Math.min(Math.max(next, 1), 100)
    //         })
    //     }

    //     canvas.addEventListener("wheel", handleWheel, { passive: false })
    //     return () => canvas.removeEventListener("wheel", handleWheel)
    // }, []);

    // return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />;
    return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}