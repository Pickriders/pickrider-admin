"use client";

import { UI } from "@/components/ui";

import React, { Suspense } from "react";
import { flexRender } from "@tanstack/react-table";
import { couriersTableColumn as columns } from "../CouriersTableColumn";
import { useGetUsersReactTableQuery } from "@/api";
import { useURLQuery } from "@/hooks";
import { GetUsersParams } from "@/services";

const LIMIT = 10;
export const DataTable = () => {
  const query = useURLQuery();
  const userSearch = query.get("search");
  // The sort control + filter popover write these to the URL; pass them through so they
  // actually reach the API (the hook otherwise only forwards `status` and `search`). The
  // backend rider list ranks by `sortBy` and returns completedDeliveries + totalEarned.
  const sortBy = query.get("sortBy") || "completedDeliveries";
  const order = (query.get("order") || "DESC") as "ASC" | "DESC";
  const bvnVerified = query.get("bvnVerified");
  const driversLicenseVerified = query.get("driversLicenseVerified");

  const params = {
    limit: LIMIT,
    isRider: "true",
    userSearch,
    order,
    sortBy,
    ...(bvnVerified ? { bvnVerified } : {}),
    ...(driversLicenseVerified ? { driversLicenseVerified } : {}),
  } as GetUsersParams;

  const { data, isLoading, table, rowSelection } = useGetUsersReactTableQuery(columns, params, {});

  return (
    <div>
      <div className="w-full overflow-x-auto scroll-bar">
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
    </div>
  );
};
