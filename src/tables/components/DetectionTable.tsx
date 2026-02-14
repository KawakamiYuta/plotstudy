import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender
} from "@tanstack/react-table"
import { useMemo } from "react"

import "../styles/DetectionTable.css"

export type Detection = {
  frame_id: number
  freq: number
  power: number
  snr: number
  timestamp: number
}

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

export function generateFakeDetections(count: number): Detection[] {
  const baseFreq = 1000
  const startTime = Date.now()

  return Array.from({ length: count }, (_, i) => {
    const freqJitter = (Math.random() - 0.5) * 50
    const power = -40 + Math.random() * 20
    const snr = 5 + Math.random() * 20

    return {
      frame_id: i,
      freq: baseFreq + freqJitter,
      power: parseFloat(power.toFixed(2)),
      snr: parseFloat(snr.toFixed(2)),
      timestamp: startTime + i * 100,
    }
  })
}

export function DetectionTable() {
  const data = useMemo(() => generateFakeDetections(30), [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="table-wrapper">
      <table className="detection-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell ??
                      cell.column.columnDef.accessorKey,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
