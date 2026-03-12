import { useState } from "react"
import { invoke } from "@tauri-apps/api/core"

import { Modal } from "../components/Modal"
import { SliderControl } from "../components/SliderControl"
import { Toolbar } from "../components/Toolbar"

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

  return (
    <>
      <Toolbar>

        <button onClick={()=>setIsOpen(true)}>
          実行
        </button>

        <button onClick={handleNextFrame}>
          Next Frame
        </button>

      </Toolbar>

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