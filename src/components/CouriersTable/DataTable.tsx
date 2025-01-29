"use client";

import { UI } from "@/components/ui";

import React, { Suspense } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CouriersTableBulkActions } from "./CouriersTableBulkActions";
import { CouriersTableFilter } from "./CouriersTableFilter";
import { couriersTableColumn as columns } from "./CouriersTableColumn";
import { DeleteCourierModal } from "./DeleteModal";
import { SuspendCourierModal } from "./SuspendModal";
import LoadingSkeleton from "./LoadingSkeleton";
import { ListUserResponseDto, User } from "@/services";

interface DataTableProps<TData> {
  data: ListUserResponseDto;
  isLoading: boolean;
}

export const DataTable = <TData,>({
  data,
  isLoading,
}: DataTableProps<TData>) => {
  const [rowSelection, setRowSelection] = React.useState({});
  const couriers = data?.results || [];
  const totalPages = data?.totalPages ?? 0;

  const table = useReactTable({
    data: couriers,
    columns: columns as ColumnDef<User>[],
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: totalPages,
    state: {
      rowSelection,
    },
  });

  console.log(data, isLoading);

  if (isLoading) {
    return (
      <div>
        <LoadingSkeleton columns={columns} />
      </div>
    );
  }

  console.log(data?.results);

  return (
    <div className="w-full overflow-x-auto scroll-bar">
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
