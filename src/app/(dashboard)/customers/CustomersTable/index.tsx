"use client";

import { UI } from "@/components/ui";
import {
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

import { ColumnDef } from "@tanstack/react-table";
import { ListUserResponseDto, User } from "@/services";
import { LoadingTable } from "./LoadingTable";
import { customersColumns as columns } from "./CustomersColumn";

interface DataTableProps<TData> {
  // data: TData[];
  data: ListUserResponseDto;
  isLoading: boolean;
}

export const CustomersTable = <TData,>({
  isLoading,
  data,
}: DataTableProps<TData>) => {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const totalPages = data?.totalPages ?? 0;
  const customers = data?.results;

  const table = useReactTable({
    data: customers,
    columns: columns as ColumnDef<User, any>[],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onRowSelectionChange: (newSelection) => {
      setRowSelection(newSelection);
    },
    state: {
      rowSelection,
    },
    enableRowSelection: true,
  });

  if (isLoading) {
    return <LoadingTable columns={columns} />;
  }

  return (
    <div>
      {/* Table data */}
      <div className="overflow-x-auto  w-full  scroll-bar">
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
    </div>
  );
};
