import { create } from "zustand"

type WaveformDialogState = {
  isOpen: boolean
  data: number[] | null

  open: (data: number[]) => void
  close: () => void
}

export const useWaveformDialogStore =
  create<WaveformDialogState>((set) => ({

    isOpen: false,
    data: null,

    open: (data) =>
      set({
        isOpen: true,
        data
      }),

    close: () =>
      set({
        isOpen: false,
        data: null
      }),

  }))