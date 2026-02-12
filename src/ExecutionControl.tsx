import { useState } from "react"
import "./ExecutionControl.css"
export type ExecutionParams = {
    threshold: number
}
export function ExecutionControl() {
    const [executionParams, setExecutionParams] = useState<ExecutionParams>({
        threshold: 10,
    });
  return (
    <div className="control-panel">
      <label>
        Min SNR
        <input
          type="number"
          value={executionParams.threshold}
          onChange={e =>
            setExecutionParams({ ...executionParams, threshold: Number(e.target.value) })
          }
        />
      </label>
      </div>
  )
}
