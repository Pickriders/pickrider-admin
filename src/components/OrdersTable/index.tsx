"use client";

import React, { Suspense } from "react";
import { flexRender } from "@tanstack/react-table";
import { OrdersTableBulkActions } from "./OrdersTableBulkActions";
import { UI } from "../ui";
import Link from "next/link";
import { OrdersTableFilter } from "./OrdersTableFilter";
import { ordersTableColumn as columns } from "./OrdersTableColumn";
import { SVG } from "../svg";
import { usePathname } from "next/navigation";
import { DeleteOrdersModal } from "./DeleteModal";
import { useGetOrdersReactTableQuery } from "@/api/queries/orders";

const LIMIT = 10;
export const OrdersTable = () => {
  const { data, table, isLoading } = useGetOrdersReactTableQuery(columns, { limit: LIMIT }, {});
  const pathname = usePathname();

  return (
    <div className="bg-background rounded-lg pb-6">
      {/* Query components */}
      <div className="px-[1.4rem] py-5 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <OrdersTableBulkActions />
          {!pathname.startsWith("/orders") && (
            <UI.Button asChild>
              <Link href={""} className="flex items-center gap-x-2">
                View Analysis
                <SVG.Analysis />
              </Link>
            </UI.Button>
          )}
        </div>
        <div className="flex items-center gap-x-2">
          <Suspense>
            <UI.TableSearchInput />
            <OrdersTableFilter />
          </Suspense>
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
          <UI.PaginationBtns totalPages={data?.totalPages ?? 0} />
        </Suspense>
      </div>

      {/* Modals */}
      <Suspense>
        <DeleteOrdersModal />
      </Suspense>
    </div>
  );
};
