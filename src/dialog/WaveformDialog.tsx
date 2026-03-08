import { useEffect, useRef } from "react"
import { useWaveformDialogStore } from "../stores/useWaveformDialogStore"
import { useViewport } from "../plots/hooks/useViewport"

import { WaveCanvas } from "./WaveformCanvas"

export default function WaveformDialog() {

  const { isOpen, data, close }
    = useWaveformDialogStore()

  if (!isOpen || !data) return null

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <button onClick={close}>close</button>

        <WaveCanvas
          data={data}
        />

      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
}

const dialogStyle: React.CSSProperties = {
  background: "#111",
  padding: 16,
  width: "80%",
  height: "80%",
  display: "flex",
  flexDirection: "column",
}