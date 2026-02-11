import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender
} from "@tanstack/react-table"

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
  }),
  columnHelper.accessor("freq", {
    header: "Freq (Hz)",
  }),
  columnHelper.accessor("power", {
    header: "Power",
  }),
  columnHelper.accessor("snr", {
    header: "SNR",
  }),
  columnHelper.accessor("timestamp", {
    header: "Timestamp",
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
  const data = generateFakeDetections(20);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table>
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
                  cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey,
                  cell.getContext()
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
