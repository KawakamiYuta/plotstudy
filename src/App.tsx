import { useRef, useState } from "react";

import * as FlexLayout from "flexlayout-react"
import "flexlayout-react/style/dark.css"

// import './App.css'

import WaveformDialog from "./dialog/WaveformDialog"
import ControlPanel from "./controls/components/ControlPanel"
import SpectrumPlot from "./plots/components/SpectrumPlot"
import { DetectionTable } from "./tables/components/DetectionTable"

const layoutJson = {
  "global": {
    "tabEnableClose": false,
    "tabEnableRename": false,
    "tabSetEnableDrop": false
  },
  "borders": [],
  "layout": {
    "type": "row",
    "id": "#126f4dd8-6f4f-4e6c-a7fc-64da0db52861",
    "children": [
      {
        "type": "row",
        "id": "#6ea25519-1fc1-41b2-8b1a-3bf75f01b081",
        "weight": 50,
        "children": [
          {
            "type": "tabset",
            "id": "#8183ef08-d18b-4bc4-92b4-f40d6618b717",
            "weight": 8.091908091908092,
            "children": [
              {
                "type": "tab",
                "id": "#5f4c92ad-d08c-49c7-86e1-69adb71e241f",
                "name": "Control",
                "component": "control"
              }
            ]
          },
          {
            "type": "row",
            "id": "#7a7472e5-b620-41bb-92bc-5cf91bd83744",
            "weight": 91.9080919080919,
            "children": [
              {
                "type": "tabset",
                "id": "#35529e78-0796-45aa-8725-543986c0b24d",
                "weight": 50,
                "children": [
                  {
                    "type": "tab",
                    "id": "#25c4fa55-4e38-4d94-b890-8992c710dee5",
                    "name": "Spectrum",
                    "component": "spectrum"
                  }
                ]
              },
              {
                "type": "tabset",
                "id": "#1a126141-cce6-4e96-8fd5-c477690c54df",
                "weight": 50,
                "children": [
                  {
                    "type": "tab",
                    "id": "#5dd970d8-2747-46b6-8344-2de5f704ab37",
                    "name": "Detections",
                    "component": "detection"
                  }
                ],
                "active": true
              }
            ]
          }
        ]
      }
    ]
  },
  "popouts": {}
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
        <FlexLayout.Layout model={model.current} factory={factory}
        // onModelChange={(m, a) => saveLayout(m)} 
        />
      </div>

      <WaveformDialog />
    </>
  )
}

// function saveLayout(model: FlexLayout.Model) {
//   const json = JSON.stringify(model.toJson(), null, 2)

//   const blob = new Blob([json], { type: "application/json" })
//   const url = URL.createObjectURL(blob)

//   const a = document.createElement("a")
//   a.href = url
//   a.download = "layout.json"
//   a.click()

//   URL.revokeObjectURL(url)
// }