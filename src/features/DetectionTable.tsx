import { createColumnHelper } from "@tanstack/react-table"

import { DataTable } from "../components/DataTable"
import { Detection, useDetectionData } from "../hooks/useDetectionData"

const columnHelper = createColumnHelper<Detection>()

const columns = [
  columnHelper.accessor("frame_id", {
    header: "Frame",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("freq", {
    header: "Freq (Hz)",
    cell: info => info.getValue().toFixed(1),
  }),
  columnHelper.accessor("power", {
    header: "Power (dB)",
    cell: info => info.getValue().toFixed(2),
  }),
  columnHelper.accessor("snr", {
    header: "SNR",
    cell: info => {
      const value = info.getValue()
      let color = "#ccc"

      if (value > 20) color = "#4caf50"
      else if (value > 10) color = "#ff9800"
      else color = "#f44336"

      return <span style={{ color }}>{value.toFixed(1)}</span>
    },
  }),
  columnHelper.accessor("timestamp", {
    header: "Time",
    cell: info => new Date(info.getValue()).toLocaleTimeString(),
  }),
]

export function DetectionTable() {
  const data = useDetectionData()
  return (
    <DataTable data={data} columns={columns} />
  )
}
