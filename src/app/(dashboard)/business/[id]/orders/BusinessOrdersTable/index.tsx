"use client";

import React, { Suspense } from "react";
import { UI } from "@/components/ui";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { ordersTableColumn as columns } from "@/components/OrdersTable/OrdersTableColumn";
import { useGetBusinessOrdersQuery } from "@/api/queries/business";

const LIMIT = 10;

export const BusinessOrdersTable = ({ businessId }: { businessId: string }) => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const { data, isLoading } = useGetBusinessOrdersQuery({ businessId, limit: LIMIT, page, order: "DESC" });
  const orders = React.useMemo(() => data?.results ?? [], [data]);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-background rounded-lg pb-6">
      <div className="w-full overflow-x-auto">
        <UI.Table>
          <UI.TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <UI.TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <UI.TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </UI.TableHead>
                ))}
              </UI.TableRow>
            ))}
          </UI.TableHeader>
          <UI.TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <UI.TableRow key={row.id}>
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
                  No orders for this business yet.
                </UI.TableCell>
              </UI.TableRow>
            )}
          </UI.TableBody>
        </UI.Table>
      </div>
      <div className="mt-3 flex justify-end px-[1.5rem]">
        <Suspense>
          <UI.PaginationBtns totalPages={data?.totalPages ?? 0} />
        </Suspense>
      </div>
    </div>
  );
};
