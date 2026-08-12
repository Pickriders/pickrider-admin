"use client";

import { UI } from "@/components/ui";
import { flexRender } from "@tanstack/react-table";
import React, { Suspense } from "react";

import { customersColumns as columns } from "./CustomersColumn";
import { useGetUsersReactTableQuery } from "@/api";
import { useURLQuery } from "@/hooks";
import { CustomersTableFilter } from "../CustomersTableFilter";
import { CustomersTableBulkAction } from "../CustomersTableBulkAction";

const LIMIT = 10;

export const CustomersTable: React.FC = () => {
  const query = useURLQuery();
  const customerSearch = query.get("search");
  const status = query.get("status");
  const verified = query.get("verified");

  const { data, isLoading, table } = useGetUsersReactTableQuery(columns, {
    limit: LIMIT,
    isRider: "false",
    role: "USER",
    userSearch: customerSearch || undefined,
    status: !status || status.toLowerCase() === "all" ? undefined : status,
    phoneVerified: verified === "true" ? "true" : undefined,
  });

  return (
    <div>
      <div className="px-3 sm:px-[1.4rem] py-5 flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <CustomersTableBulkAction />
        <div className="flex items-center gap-x-2">
          <Suspense>
            <UI.TableSearchInput
              placeholder="Search name, phone, email or NIN..."
              className="sm:w-72"
              onSearch={(text) => {
                query.setMultiple({ search: text, page: "1" });
              }}
              value={customerSearch}
            />

            <CustomersTableFilter />
          </Suspense>
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
            {table.getRowModel()?.rows?.length ? (
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

      <div className="mt-3 flex justify-end px-[1.5rem]">
        <Suspense>
          <UI.PaginationBtns totalPages={data?.totalPages || 0} />
        </Suspense>
      </div>
    </div>
  );
};
