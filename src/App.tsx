import { useEffect, useRef, useState } from "react";
import * as FlexLayout from "flexlayout-react"
// import "flexlayout-react/style/rounded.css"
import "./flexlayout.css"

// import './App.css'

import WaveformDialog from "./dialog/WaveformDialog"
import ControlPanel from "./controls/components/ControlPanel"
import SpectrumPlot from "./plots/components/SpectrumPlot"
import { DetectionTable } from "./tables/components/DetectionTable"
import { WaveCanvas } from "./dialog/WaveformCanvas";

import { useLayoutStore } from "./stores/useLayoutStore";



export default function App() {
  const { model, index } = useLayoutStore.getState()

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent()
    // return <div className="placeholder">{component}</div>
    console.log("factory", component) 
    if (component === "control") return (
    <div className="control" ><ControlPanel /></div>
    )
    if (component === "spectrum") return (
           <SpectrumPlot />
    )
    if (component === "detection") return (
          <DetectionTable />
    )
      console.log("waveform factory")
    if (component === "waveform") return (
      <WaveCanvas data={node.getConfig().data} />
    )

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

      <WaveformDialog />
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