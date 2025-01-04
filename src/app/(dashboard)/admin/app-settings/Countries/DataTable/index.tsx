"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { UI } from "@/components/ui";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <div className="rounded-md  ">
      <UI.Table>
        <UI.TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <UI.TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b "
              >
                {row.getVisibleCells().map((cell) => (
                  <UI.TableCell key={cell.id} className="py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </UI.TableCell>
                ))}
              </UI.TableRow>
            ))
          ) : (
            <UI.TableRow>
              <UI.TableCell
                colSpan={columns.length}
                className="h-24 text-center font-montserrat"
              >
                No results.
              </UI.TableCell>
            </UI.TableRow>
          )}
        </UI.TableBody>
      </UI.Table>
    </div>
  );
}
