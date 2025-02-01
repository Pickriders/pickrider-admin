"use client";

import { UI } from "@/components/ui";

import React, { Suspense } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { VehiclesTableBulkActions } from "./VehiclesTableBulkActions";
import { VehicleTableFilter } from "./VehicleTableFilter";
import { vehicleTableColumn as columns } from "./VehiclesTableColumn";
import { DeleteVehicleModal } from "./DeleteModal";
import { SuspendVehicleModal } from "./SuspendModal";
import { useGetVehiclesQuery, useGetVehiclesReactTableQuery } from "@/api";
import { Vehicle } from "@/services";

const LIMIT = 10;

export const VechiclesTable: React.FC = () => {
  const { data, isLoading, table, rowSelection } = useGetVehiclesReactTableQuery(columns);

  return (
    <div className="bg-background rounded-lg pb-6">
      {/* Query components */}
      <div className="px-[1.4rem] py-5 flex items-center justify-between">
        <VehiclesTableBulkActions />
        <div className="flex items-center gap-x-2">
          <UI.TableSearchInput />
          <VehicleTableFilter />
        </div>
      </div>

      {/* Table date */}
      <div>
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
            ) : isLoading ? (
              <UI.TableLoading rowCount={LIMIT} columnCount={columns.length} />
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
          <UI.PaginationBtns currentPage={data?.currentPage ?? 0} totalPages={data?.totalPages ?? 0} />
        </Suspense>
      </div>

      {/* Modals */}
      <Suspense>
        <DeleteVehicleModal />
        <SuspendVehicleModal />
      </Suspense>
    </div>
  );
};
