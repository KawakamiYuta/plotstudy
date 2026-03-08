import * as FlexLayout from "flexlayout-react"
import "flexlayout-react/style/light.css"

function Spectrum() {
  return <div>Spectrum View</div>
}

function Waveform() {
  return <div>Waveform View</div>
}

function Waterfall() {
  return <div>Waterfall View</div>
}

const json = {
  global: {},
  borders: [],
  layout: {
    type: "row",
    children: []
  }
}

export function useDocUI() {
    
}

export default function App() {
  const model = FlexLayout.Model.fromJson(json)

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent()

    if (component === "spectrum") {
      return <Spectrum />
    }

    if (component === "waveform") {
      return <Waveform />
    }

    if (component === "waterfall") {
      return <Waterfall />
    }
  }

  return (
    <div style={{ height: "100vh" }}>
      <FlexLayout.Layout model={model} factory={factory} />
    </div>
  )
}