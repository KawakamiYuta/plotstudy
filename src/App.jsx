import React from "react";
// import WaveformBarChart from "./WaveformBarChartCanvas";
import WaveformWithAxis from "./WaveformWithAxis";
import ControlPanel from "./ControlPanel";
const data = Array.from({ length: 64 }, (_, i) =>
  Math.pow(Math.sin(i * 0.2), 2) * (Math.random() * 0.5 + 0.5) * 100
);

export default function App() {
  return (<>
  <ControlPanel />
  <WaveformWithAxis />
  </>);
}