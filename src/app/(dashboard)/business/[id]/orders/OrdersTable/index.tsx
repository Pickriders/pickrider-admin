"use client";

import { UI } from "@/components/ui";
import { OrdersTableBulkActions } from "../OrdersTableBulkActions";
import { OrdersTableFilter } from "../OrdersTableFilter";
import Link from "next/link";
import { SVG } from "@/components/svg";
import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTableProps } from "@/components/ui/Table/Table.type";

export const OrdersTable = <TData, TValue>({
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
    <div className="bg-background rounded-lg pb-6">
      {/* Query components */}
      <div className="px-[1.4rem] py-5 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <OrdersTableBulkActions />
          <UI.Button asChild>
            <Link href={""} className="flex items-center gap-x-2">
              View Analysis
              <svg
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-primary-foreground"
              >
                <path
                  d="M5.16602 11.3327V8.66602"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M8.5 11.3327V4.66602"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M11.834 11.334V7.33398"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M2.16602 7.99935C2.16602 5.01379 2.16602 3.52101 3.09351 2.59351C4.02101 1.66602 5.51379 1.66602 8.49935 1.66602C11.4849 1.66602 12.9777 1.66602 13.9052 2.59351C14.8327 3.52101 14.8327 5.01379 14.8327 7.99935C14.8327 10.9849 14.8327 12.4777 13.9052 13.4052C12.9777 14.3327 11.4849 14.3327 8.49935 14.3327C5.51379 14.3327 4.02101 14.3327 3.09351 13.4052C2.16602 12.4777 2.16602 10.9849 2.16602 7.99935Z"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </UI.Button>
        </div>
        <div className="flex items-center gap-x-2">
          <UI.TableSearchInput />
          <OrdersTableFilter />
        </div>
      </div>

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
