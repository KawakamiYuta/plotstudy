import { listen } from "@tauri-apps/api/event";

type FrameListener = (samples: number[]) => void;

class FrameStore {
  private latestSamples: number[] | null = null;
  private listeners: FrameListener[] = [];
  private running = false;

  async init() {
    await listen<number[]>("wave-frame", (event) => {
      // 常に最新だけ保持（古いのは捨てる）
      this.latestSamples = event.payload;
      console.log("Received frame");
    });

    this.startRenderLoop();
    console.log("FrameStore initialized");
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
      if (this.latestSamples) {
        const frame = this.latestSamples;
        this.latestSamples = null;

        // 購読者へ通知
        for (const l of this.listeners) {
          l(frame);
        }
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

export const frameStore = new FrameStore();
