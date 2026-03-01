import { listen } from "@tauri-apps/api/event";
export interface FrameData {
  frame_number: number;
  samples: number[];
  spectrum: number[];

  // auxiliary information that may accompany a frame
  threshold?: number;                        // current threshold level
  highlight_range?: { start: number; end: number }; // optional highlighted bin range
  analysis_bins?: number[];                   // bins with special coloring
}

type FrameListener = (frame: FrameData) => void;

class FrameStore {
  private latestFrame: FrameData | null = null;
  private listeners: FrameListener[] = [];
  private running = false;

  async init() {
    await listen<FrameData>("wave-frame", (event) => {
      this.latestFrame = event.payload;
    });

    this.startRenderLoop();
  }

subscribe(listener: FrameListener) {
  this.listeners.push(listener);

  return () => {
    this.listeners = this.listeners.filter(l => l !== listener);
  };
}
  private startRenderLoop() {
    if (this.running) return;
    this.running = true;

    const loop = () => {
      if (this.latestFrame) {
        const frame = this.latestFrame;
        this.latestFrame = null;

        // 購読者へ通知
        for (const l of this.listeners) {
          console.log("Notifying listener with frame", frame);
          l(frame);
        }
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

export const frameStore = new FrameStore();
