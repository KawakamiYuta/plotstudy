import { create } from "zustand"

type Viewport = {
  scaleX: number
  offsetX: number
}

type WaveformDialogState = {
  isOpen: boolean
  data: Float32Array | null
  sampleRate: number
  viewport: Viewport

  open: (data: Float32Array, sampleRate: number) => void
  close: () => void
  setViewport: (v: Partial<Viewport>) => void
}

export const useWaveformDialogStore = create<WaveformDialogState>(
  (set) => ({
    isOpen: false,
    data: null,
    sampleRate: 48000,

    viewport: {
      scaleX: 1,
      offsetX: 0,
    },

    open: (data, sampleRate) =>
      set({
        isOpen: true,
        data,
        sampleRate,
        viewport: { scaleX: 1, offsetX: 0 },
      }),

    close: () => set({ isOpen: false }),

    setViewport: (v) =>
      set((state) => ({
        viewport: { ...state.viewport, ...v },
      })),
  })
)