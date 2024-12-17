"use client";

import { UI } from "@/components/ui";
import { BusinessTableBulkAction } from "../BusinessTableBulkAction";
import { BusinessTableFilter } from "../BusinessTableFilter";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { DataTableProps } from "@/components/ui/Table/Table.type";

export const BusinessTable = <TData, TValue>({
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
    <div className="bg-background rounded-lg pb-6 w-full">
      {/* Query components */}
      <div className="px-[1.4rem] py-5 flex items-center justify-between">
        <BusinessTableBulkAction />
        <div className="flex items-center gap-x-2">
          <UI.TableSearchInput />
          <BusinessTableFilter />
        </div>
      </div>

      {/* Table date */}
      <div className="w-full overflow-x-auto">
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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

      {/* Pagination */}
      <div className="mt-3 flex justify-end px-[1.5rem]">
        <UI.PaginationBtns currentPage={2} totalPages={4} />
      </div>
    </div>
  );
};
