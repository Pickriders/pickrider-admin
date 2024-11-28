"use client";

import { UI } from "@/components/ui";
import { CustomerPhoneVerified } from "../CustomersPhoneVerified";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
// import { DataTableProps } from "./CustomersTable.type";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export const CustomersTable = <TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) => {
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
    <div className="overflow-x-auto">
      <UI.Table>
        <UI.TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <UI.TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <UI.TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </UI.TableHead>
                );
              })}
            </UI.TableRow>
          ))}
        </UI.TableHeader>
        <UI.TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <UI.TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <UI.TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </UI.TableCell>
                ))}
              </UI.TableRow>
            ))
          ) : (
            <UI.TableRow>
              <UI.TableCell
                colSpan={columns.length}
                className="h-24 text-center font-faktum-test font-semibold"
              >
                No results.
              </UI.TableCell>
            </UI.TableRow>
          )}
        </UI.TableBody>
      </UI.Table>
    </div>
  );
};
