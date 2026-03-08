import { useRef, useState } from "react"
import { useWaveformDialogStore } from "../stores/useWaveformDialogStore"
import { WaveCanvas } from "./WaveformCanvas"

export default function WaveformDialog() {

  const { isOpen, data, close } = useWaveformDialogStore()

  const dialogRef = useRef<HTMLDivElement | null>(null)

  const [rect, setRect] = useState({
    x: 200,
    y: 100,
    width: 800,
    height: 400,
  })

  const dragState = useRef<{x:number,y:number}|null>(null)
  const resizeState = useRef<{x:number,y:number,width:number,height:number}|null>(null)

  if (!isOpen || !data) return null

  // ------------------------
  // drag
  // ------------------------

  function onDragStart(e: React.MouseEvent) {

    dragState.current = {
      x: e.clientX - rect.x,
      y: e.clientY - rect.y
    }

    window.addEventListener("mousemove", onDragMove)
    window.addEventListener("mouseup", onDragEnd)
  }

  function onDragMove(e: MouseEvent) {

    if (!dragState.current) return

    setRect(r => ({
      ...r,
      x: e.clientX - dragState.current!.x,
      y: e.clientY - dragState.current!.y
    }))
  }

  function onDragEnd() {
    dragState.current = null
    window.removeEventListener("mousemove", onDragMove)
    window.removeEventListener("mouseup", onDragEnd)
  }

  function onResizeStart(e: React.MouseEvent) {

    e.stopPropagation()

    resizeState.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height
    }

    window.addEventListener("mousemove", onResizeMove)
    window.addEventListener("mouseup", onResizeEnd)
  }

  function onResizeMove(e: MouseEvent) {

    if (!resizeState.current) return

    const dx = e.clientX - resizeState.current.x
    const dy = e.clientY - resizeState.current.y

    setRect(r => ({
      ...r,
      width: resizeState.current!.width + dx,
      height: resizeState.current!.height + dy
    }))
  }

  function onResizeEnd() {
    resizeState.current = null
    window.removeEventListener("mousemove", onResizeMove)
    window.removeEventListener("mouseup", onResizeEnd)
  }

  return (
    <div style={overlayStyle}>

      <div
        ref={dialogRef}
        style={{
          ...dialogStyle,
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height
        }}
      >

        <div style={headerStyle} onMouseDown={onDragStart}>
          waveform
          <button onClick={close}>x</button>
        </div>

        <div style={{flex:1, minHeight: 0}}>
          <WaveCanvas data={data}/>
        </div>

        <div style={resizeHandle} onMouseDown={onResizeStart} />

      </div>

    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  width: "100%",
  height: "100%",
  display: "flex",
}

const dialogStyle: React.CSSProperties = {
  position: "absolute",
  background: "#111",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #444",
  width: "100%",
  height: "100%",
}

const headerStyle: React.CSSProperties = {
  height: 30,
  background: "#222",
  cursor: "move",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 8px",
}

const resizeHandle: React.CSSProperties = {
  position: "absolute",
  right: 0,
  bottom: 0,
  width: 16,
  height: 16,
  cursor: "nwse-resize",
}