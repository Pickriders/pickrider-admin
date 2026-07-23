"use client";

import { UI } from "@/components/ui";
import { flexRender } from "@tanstack/react-table";
import { columns } from "./Columns";
import React, { Suspense } from "react";
import { useGetOrdersReactTableQuery } from "@/api/queries/orders";

const LIMIT = 10;

interface DataTableProps {
  status: string;
  orderNumber?: string;
}

export const DataTable = ({ status, orderNumber }: DataTableProps) => {
  const query = React.useMemo(() => ({ limit: LIMIT, status, orderNumber }), [status, orderNumber]);
  const { data, table, isLoading } = useGetOrdersReactTableQuery(columns, query, {});

  return (
    <div>
      <div className="w-full overflow-x-auto">
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

      <div className="flex items-center justify-end mt-6">
        <Suspense>
          <UI.PaginationBtns totalPages={data?.totalPages ?? 0} />
        </Suspense>
      </div>
    </div>
  );
};
