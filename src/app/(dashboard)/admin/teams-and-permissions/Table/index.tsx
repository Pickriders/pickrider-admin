"use client";

import { UI } from "@/components/ui";
import { BulkActions } from "./BulkActions";
import { Filter } from "./Filter";

import { flexRender } from "@tanstack/react-table";
import React, { Suspense } from "react";
import { RemoveModal } from "./RemoveModal";
import { SuspendModal } from "./SuspendModal";
import { columns } from "./Column";
import { useGetUsersReactTableQuery } from "@/api/queries/user";
import { PLATFORM_STAFF_ROLES } from "@/lib/admin-access";

const LIMIT = 10;

export function DataTable() {
  const [search, setSearch] = React.useState("");
  const query = React.useMemo(
    () => ({
      role: PLATFORM_STAFF_ROLES.join(","),
      limit: LIMIT,
      userSearch: search || undefined,
    }),
    [search],
  );
  const { data, table, isLoading } = useGetUsersReactTableQuery(columns, query, {});

  return (
    <div className="bg-background rounded-xl pb-4">
      {/* Query components */}
      <div className="px-[1.4rem] py-5 flex sm:flex-row flex-col gap-y-3 sm:items-center justify-between">
        <BulkActions />
        <div className="flex items-center gap-x-2">
          <UI.TableSearchInput onSearch={setSearch} />
          <Filter />
        </div>
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
      <Suspense>
        {/* Pagination */}
        <div className="mt-3 flex justify-end px-[1.5rem]">
          <UI.PaginationBtns totalPages={data?.totalPages ?? 0} />
        </div>

        {/* Modals */}

        <RemoveModal />
        <SuspendModal />
      </Suspense>
    </div>
  );
}
