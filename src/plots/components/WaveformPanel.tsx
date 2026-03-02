import { useDraggable } from "../hooks/useDraggable";
import { WaveformCanvas } from "./WaveformCanvas";

type Props = {
  id: number;
  startBin: number;
  endBin: number;
  x: number;
  y: number;
  z: number;
  onClose: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
};

export function WaveformPanel(props: Props) {
  const { onPointerDown, onPointerMove, onPointerUp } =
    useDraggable(props.x, props.y, props.onMove, props.onFocus);

  return (
    <div
      style={{
        position: "fixed",
        left: props.x,
        top: props.y,
        width: 600,
        background: "#111",
        border: "1px solid #444",
        zIndex: props.z,
      }}
      onPointerDown={props.onFocus}
    >
      <div
        style={{
          cursor: "move",
          padding: "4px 8px",
          background: "#222",
          display: "flex",
          justifyContent: "space-between",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span>
          waveform {props.startBin}-{props.endBin}
        </span>
        <button onClick={props.onClose}>✕</button>
      </div>

      <WaveformCanvas
        startBin={props.startBin}
        endBin={props.endBin}
      />
    </div>
  );
}