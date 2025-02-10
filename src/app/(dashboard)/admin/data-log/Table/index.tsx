"use client";

import { UI } from "@/components/ui";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import React, { Suspense } from "react";
import { Filter } from "./Filter";
import JsonPreviewModal from "../JsonPreviewModal";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {},
  });

  return (
    <div className="bg-background rounded-xl pb-4 border">
      <div className="px-[1.4rem] py-5 flex items-center gap-x-1 ">
        <UI.TableSearchInput />
        <Filter />
      </div>
      <div className="overflow-x-auto  w-full  scroll-bar">
        <UI.Table>
          <UI.TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <UI.TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <UI.TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </UI.TableHead>
                  );
                })}
              </UI.TableRow>
            ))}
          </UI.TableHeader>

          <UI.TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <UI.TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <UI.TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </UI.TableCell>
                  ))}
                </UI.TableRow>
              ))
            ) : (
              <UI.TableRow>
                <UI.TableCell colSpan={columns.length} className="h-24 text-center font-faktum-test font-semibold">
                  No results.
                </UI.TableCell>
              </UI.TableRow>
            )}
          </UI.TableBody>
        </UI.Table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex justify-end px-[1.5rem]">
        <Suspense>
          <UI.PaginationBtns currentPage={2} totalPages={4} />
        </Suspense>
      </div>

      <JsonPreviewModal code={jsonData} />
    </div>
  );
}

// TEST DATE
const jsonData = JSON.stringify(
  [
    {
      id: "ckeod@pcy0001ilpra5ojb551",
      timestamp: "2020-09-04T14:54:50.000Z",
      resource: "PROJECT",
      action: "CREATE",
      payload: {
        name: "Project A",
        region: "LOCAL",
        status: "Active",
        owner: "John Doe",
      },
      triggeredBy: "unknown",
      triggerType: "USER",
    },
    {
      id: "ckepx@qzv0002ilpra5kjb882",
      timestamp: "2021-06-12T09:22:30.000Z",
      resource: "TASK",
      action: "UPDATE",
      payload: {
        title: "Fix UI bug",
        priority: "High",
        assignedTo: "Jane Smith",
        dueDate: "2024-02-15",
      },
      triggeredBy: "admin",
      triggerType: "SYSTEM",
    },
    {
      id: "ckerg@mnx0003ilpra5llc913",
      timestamp: "2023-11-22T16:40:10.000Z",
      resource: "USER",
      action: "DELETE",
      payload: {
        userId: "usr_928374",
        reason: "Violation of terms",
        deletedBy: "moderator",
      },
      triggeredBy: "moderator",
      triggerType: "MANUAL",
    },
  ],
  null,
  2,
);
