import { useRef } from "react";

import * as FlexLayout from "flexlayout-react"
import "flexlayout-react/style/dark.css"

// import './App.css'

import WaveformDialog from "./dialog/WaveformDialog"
import ControlPanel from "./controls/components/ControlPanel"
import SpectrumPlot from "./plots/components/SpectrumPlot"
import { DetectionTable } from "./tables/components/DetectionTable"

const layoutJson = {
  global: {
      tabSetEnableDrop: false,
      tabEnableClose: false,
      tabSetEnableDrag: false,
      tabEnableDrag: false,
      tabEnableRename: false
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 20,
        children: [
          {
            type: "tab",
            name: "Control",
            component: "control"
          }
        ]
      },
      {
        type: "column",
        weight: 80,
        children: [
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                name: "Spectrum",
                component: "spectrum"
              }
            ]
          },
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                name: "Detections",
                component: "detection"
              }
            ]
          }
        ]
      }
    ]
  }
}

export default function App() {

  const model = useRef<FlexLayout.Model>(
    FlexLayout.Model.fromJson(layoutJson)
  )

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent()

    // return <div className="placeholder">{component}</div>
    console.log("factory", component) 
    if (component === "control") return (
    <div className="control" ><ControlPanel /></div>
    )
    if (component === "spectrum") return (
      <div className="main">
        <div className="left">
           <SpectrumPlot />
        </div>
      </div>
    )
    if (component === "detection") return (
      <div className="main">
        <div className="right">
          <DetectionTable />
        </div>
      </div>
    )

    return <div className="placeholder">{component}</div>
  }

  return (
    <>
      <div style={{ height: "100vh" }}>
        <FlexLayout.Layout model={model.current} factory={factory} />
      </div>

      <WaveformDialog />
    </>
  )
}