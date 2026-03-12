import { useState } from "react"
import { invoke } from "@tauri-apps/api/core"

import { Modal } from "../components/Modal"
import { SliderControl } from "../components/SliderControl"
import { Toolbar } from "../components/Toolbar"
import { StatusBar } from "../components/StatusBar"
import { StatusLabel } from "../components/StatusLabel"

import "../styles/ControlPanel.css"

export default function ControlPanel(){

  const [isOpen,setIsOpen] = useState(false)
  const [threshold,setThreshold] = useState(20)

  const handleNextFrame = async ()=>{
    await invoke("pull_frame")
  }

  const handleExecute = async ()=>{
    await invoke("run_external_command",{
      params:{threshold}
    })
    setIsOpen(false)
  }
  const frame = 120
  const detections = 3
  const fps = 59
  return (
    <>
    <div className="control-panel">
      <Toolbar>

        <button onClick={()=>setIsOpen(true)}>
          実行
        </button>

        <button onClick={handleNextFrame}>
          Next Frame
        </button>

      </Toolbar>

      <StatusBar>

        <StatusLabel label="Frame" value={frame} />

        <StatusLabel label="Detections" value={detections} />

        <StatusLabel label="FPS" value={fps} />

      </StatusBar>
</div>
      <Modal
        open={isOpen}
        title="実行パラメータ"
        onClose={()=>setIsOpen(false)}
        footer={
          <>
            <button onClick={()=>setIsOpen(false)}>
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