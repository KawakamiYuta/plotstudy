import * as FlexLayout from "flexlayout-react"
import "../styles/flexlayout.css"

import './App.css'

import ControlPanel from "../features/ControlPanel"
import SpectrumPlot from "../features/SpectrumPlot"
import { DetectionTable } from "../features/DetectionTable"
import { WaveCanvas } from "../features/WaveformCanvas";

import { useLayoutStore } from "../stores/useLayoutStore";
// import WaterfallCanvas from "../features/WaterfallCanvas";



export default function App() {
  const { model, index } = useLayoutStore.getState()

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent()
    // return <div className="placeholder">{component}</div>
    console.log("factory", component) 
    if (component === "control") return (
    <ControlPanel />
    )
    if (component === "spectrum") return (
           <SpectrumPlot />
    )
    if (component === "detection") return (
          <DetectionTable />
    )
    if (component === "waveform") return (
      <WaveCanvas data={node.getConfig().data} />
    )

    // if (component === "waterfall") return (
    //   <WaterfallCanvas />
    // )

    return <div className="placeholder">{component}</div>
  }
console.log(index)
  return (
    <>
      <div style={{ height: "100vh" }}>
        <FlexLayout.Layout model={model} factory={factory}
        // onModelChange={(m, a) => window.dispatchEvent(new Event("layout-changed"))}
        // onModelChange={(m, a) => {
        //   saveLayout(m)
        //   console.log("newmodel", m)
        // }} 
        />
      </div>
    </>
  )
}

function saveLayout(model: FlexLayout.Model) {
  const json = JSON.stringify(model.toJson(), null, 2)

  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "layout.json"
  a.click()

  URL.revokeObjectURL(url)
}