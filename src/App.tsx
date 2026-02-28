import React, { useState } from "react";
// import WaveformBarChart from "./WaveformBarChartCanvas";
import Spectrum from "./plots/components/Plots";
import ControlPanel from "./controls/components/ControlPanel";
import { DetectionTable } from "./tables/components/DetectionTable";

import "./App.css";
// import { ExecutionControl } from "./ExecutionControl";
const data = Array.from({ length: 64 }, (_, i) =>
  Math.pow(Math.sin(i * 0.2), 2) * (Math.random() * 0.5 + 0.5) * 100
);

export default function App() {
  const [threshold, setThreshold] = useState(20);

  return (
    <div className="app">
      <div className="control">
        <ControlPanel threshold={threshold} setThreshold={setThreshold} />
      </div>

      <div className="main">
        <div className="left">
          <Spectrum highlightRange={{ start: 330, end: 500 }} threshold={threshold} />
        </div>

        <div className="right">
          <DetectionTable />
        </div>
      </div>
    </div>
  );
}
