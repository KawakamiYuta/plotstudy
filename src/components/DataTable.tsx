import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table"

import "./DataTable.css"

type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T, any>[]
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  className
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="table-wrapper">
      <table className={className ?? "data-table"}>
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