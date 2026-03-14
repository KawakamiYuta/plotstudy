import { TauriRenderStream } from "./tauriRenderListener";

export interface FrameData {
  frame_number: number;
  samples: number[];
  spectrum: number[];

  // auxiliary information that may accompany a frame
  threshold?: number;                        // current threshold level
  highlight_range?: { start: number; end: number }; // optional highlighted bin range
  analysis_bins?: number[];                   // bins with special coloring
  // mapping from a center-bin index to an array of bins that should be
  // highlighted/overlaid when that center is clicked in analysis mode.
  overlay_bins_by_center?: Record<number, number[]>;
}

export const frameStore = new TauriRenderStream<FrameData>("wave-frame")