"use client";

import { UI } from "@/components/ui";
import { EmptyIcon } from "./EmptyIcon";
import { TableFilter } from "./Filter";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./TableColumn";
import { Suspense } from "react";

interface DataTableProps<TData> {
  data: TData[];
}

export const HistoryTable = <TData,>({ data }: DataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns: columns as ColumnDef<TData>[],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-2">
      <UI.Table>
        <UI.TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <UI.TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <UI.TableHead
                    key={header.id}
                    className="text-sm font-clash-display"
                  >
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
                  <UI.TableCell key={cell.id} className="text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </UI.TableCell>
                ))}
              </UI.TableRow>
            ))
          ) : (
            <UI.TableRow className="hover:bg-transparent">
              <UI.TableCell colSpan={columns.length} className="h-[20rem]">
                <div className="grid place-items-center">
                  <EmptyIcon />
                </div>
              </UI.TableCell>
            </UI.TableRow>
          )}
        </UI.TableBody>
      </UI.Table>
      <div className="mt-12 flex items-center justify-between">
        <TableFilter />
        <Suspense>
          <UI.PaginationBtns currentPage={1} totalPages={3} />
        </Suspense>
      </div>
    </div>
  );
};
