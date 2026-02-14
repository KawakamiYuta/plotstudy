import React from "react";
// import WaveformBarChart from "./WaveformBarChartCanvas";
import Plots from "./plots/components/Plots";
import ControlPanel from "./controls/components/ControlPanel";
import { DetectionTable } from "./tables/components/DetectionTable";

import "./App.css";
// import { ExecutionControl } from "./ExecutionControl";
const data = Array.from({ length: 64 }, (_, i) =>
  Math.pow(Math.sin(i * 0.2), 2) * (Math.random() * 0.5 + 0.5) * 100
);

export default function App() {
  return (
    <div className="app">
      <div className="control">
        {/* <ControlPanel /> */}
          <ControlPanel />
      </div>

      <div className="main">
        <div className="left">
          <Plots />
        </div>

        <div className="right">
          <DetectionTable />
        </div>
      </div>
    </div>
  )
}
