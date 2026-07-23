"use client";

import { UI } from "@/components/ui";
import { BusinessTableBulkAction } from "../BusinessTableBulkAction";
import { BusinessTableFilter } from "../BusinessTableFilter";
import { flexRender } from "@tanstack/react-table";
import React, { Suspense } from "react";
import { businessTableColumn as columns } from "../BusinessTableColumn";
import { useGetUsersReactTableQuery } from "@/api/queries/user";

const LIMIT = 10;

export const BusinessTable = () => {
  const [search, setSearch] = React.useState("");
  // Business owners carry the BUSINESS_ADMIN role (there is no plain BUSINESS
  // role on the core backend).
  const query = React.useMemo(
    () => ({ role: "BUSINESS_ADMIN", limit: LIMIT, userSearch: search || undefined }),
    [search],
  );
  const { data, table, isLoading } = useGetUsersReactTableQuery(columns, query, {});

  return (
    <div className="bg-background rounded-lg pb-6 w-full">
      {/* Query components */}
      <div className="px-[1.4rem] py-5 flex sm:flex-row flex-col gap-y-3 sm:items-center justify-between">
        <BusinessTableBulkAction />
        <div className="flex items-center gap-x-2">
          <UI.TableSearchInput onSearch={setSearch} />
          <BusinessTableFilter />
        </div>
      </div>

      {/* Table data */}
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
    </div>
  );
};
