import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"

import { Modal } from "../components/Modal"
import { SliderControl } from "../components/SliderControl"
import { Toolbar } from "../components/Toolbar"
import { StatusBar } from "../components/StatusBar"
import { StatusLabel } from "../components/StatusLabel"

import { frameStore } from "../stores/frameStore"

import "../styles/ControlPanel.css"

export default function ControlPanel() {

  const [isOpen, setIsOpen] = useState(false)
  const [threshold, setThreshold] = useState(20)
  const [frameNo, setFrameNo] = useState(-1)

  const handleNextFrame = async () => {
    await invoke("pull_frame")
  }

  const handleExecute = async () => {
    await invoke("run_external_command", {
      params: { threshold }
    })
    setIsOpen(false)
  }

  useEffect(() => {
    const unsubscribe = frameStore.subscribe((frame) => {
      setFrameNo(frame.frame_number)
    })
    return unsubscribe  
  },[])

  // const frame = 120
  // const detections = 3
  // const fps = 59
  return (
    <>
      <div className="control-panel">
        <StatusBar>

          <StatusLabel label="Frame" value={frameNo} />

          {/* <StatusLabel label="Detections" value={detections} />

          <StatusLabel label="FPS" value={fps} /> */}

        </StatusBar>
        <Toolbar>

          <button onClick={() => setIsOpen(true)}>
            実行
          </button>

          <button onClick={handleNextFrame}>
            Next Frame
          </button>

        </Toolbar>
      </div>
      <Modal
        open={isOpen}
        title="実行パラメータ"
        onClose={() => setIsOpen(false)}
        footer={
          <>
            <button onClick={() => setIsOpen(false)}>
              キャンセル
            </button>

            <button onClick={handleExecute}>
              実行
            </button>
          </>
        }
      >

        <SliderControl
          label="Threshold"
          value={threshold}
          onChange={setThreshold}
        />

      </Modal>
    </>
  )
}