import { create } from "zustand"

type Tab = {
  id: string
  title: string
  kind: "static" | "dynamic"
  component: React.ComponentType<any>
  props?: any
}

type TabStore = {
  tabs: Tab[]
  activeTab: string

  openTab: (tab: Tab) => void
  closeTab: (id: string) => void
  setActive: (id: string) => void
}

export const useTabStore = create<TabStore>((set) => ({
  tabs: [
    {
      id: "spectrum",
      title: "Spectrum",
      kind: "static",
      component: SpectrumView,
    },
    {
      id: "waterfall",
      title: "Waterfall",
      kind: "static",
      component: WaterfallView,
    },
  ],

  activeTab: "spectrum",

  openTab: (tab) =>
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTab: tab.id,
    })),

  closeTab: (id) =>
    set((state) => ({
      tabs: state.tabs.filter((t) => t.id !== id),
      activeTab: state.activeTab === id ? "spectrum" : state.activeTab,
    })),

  setActive: (id) => set({ activeTab: id }),
}))