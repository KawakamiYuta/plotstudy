// WaveformManager.tsx
import { useEffect, useRef, useState } from "react";
import { WaveformPanel } from "./WaveformPanel";

type Panel = {
  id: number;
  startBin: number;
  endBin: number;
  x: number;
  y: number;
  z: number;
};

type Props = {
  registerOpen: (fn: (s: number, e: number) => void) => void;
};

export function WaveformManager({ registerOpen }: Props) {
  const [panels, setPanels] = useState<Panel[]>([]);
  const nextId = useRef(1);
  const nextZ = useRef(1);

  const openPanel = (startBin: number, endBin: number) => {
    const id = nextId.current++;
    const z = nextZ.current++;

    setPanels(p => [
      ...p,
      {
        id,
        startBin,
        endBin,
        x: 120,
        y: 120,
        z,
      },
    ]);
  };

  // ← ここが重要
  useEffect(() => {
    registerOpen(openPanel);
  }, []);

  const closePanel = (id: number) =>
    setPanels(p => p.filter(panel => panel.id !== id));

  const bringToFront = (id: number) => {
    const z = nextZ.current++;
    setPanels(p =>
      p.map(panel =>
        panel.id === id ? { ...panel, z } : panel
      )
    );
  };

  const movePanel = (id: number, x: number, y: number) =>
    setPanels(p =>
      p.map(panel =>
        panel.id === id ? { ...panel, x, y } : panel
      )
    );

  return (
    <>
      {panels.map(panel => (
        <WaveformPanel
          key={panel.id}
          {...panel}
          onClose={() => closePanel(panel.id)}
          onFocus={() => bringToFront(panel.id)}
          onMove={(x, y) => movePanel(panel.id, x, y)}
        />
      ))}
    </>
  );
}