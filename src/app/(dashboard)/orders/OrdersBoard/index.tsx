"use client";

import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import { UI } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useURLQuery } from "@/hooks";
import { useGetOrdersReactTableQuery, useGetOrderStatusCountsQuery } from "@/api/queries/orders";
import { ordersTableColumn as columns } from "@/components/OrdersTable/OrdersTableColumn";

const LIMIT = 10;

const STATUS_TABS = [
  { id: "ALL", label: "All", key: "total" as const, color: "#64708a" },
  { id: "INITIATED", label: "Awaiting rider", key: "initiated" as const, color: "#DBAD0E" },
  { id: "ACCEPTED", label: "Accepted", key: "accepted" as const, color: "#2282C8" },
  { id: "ON_GOING", label: "Ongoing", key: "ongoing" as const, color: "#3E7DF6" },
  { id: "COMPLETED", label: "Completed", key: "completed" as const, color: "#32BA7C" },
  { id: "CANCELLED", label: "Cancelled", key: "cancelled" as const, color: "#FF5244" },
];

const TYPES = ["ALL", "SINGLE", "BATCH", "BULK"];

export const OrdersBoard = () => {
  const query = useURLQuery();
  const status = query.get("status") || "ALL";
  const orderType = query.get("orderType") || "ALL";
  const search = query.get("search");

  const { data: counts } = useGetOrderStatusCountsQuery();

  const tableQuery = React.useMemo(() => ({ limit: LIMIT, orderNumber: search || undefined }), [search]);
  const { data, table, isLoading } = useGetOrdersReactTableQuery(columns, tableQuery, {});

  const setStatus = (id: string) => query.setMultiple({ status: id === "ALL" ? undefined : id, page: "1" });

  return (
    <div className="space-y-5">
      {/* Summary tiles — click to filter */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatus(tab.id)}
              className={cn(
                "rounded-2xl border bg-card p-4 text-left transition-all hover:shadow-sm",
                active && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: tab.color }} />
                <span className="text-xs font-medium text-muted-foreground">{tab.label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {(counts?.[tab.key] ?? 0).toLocaleString()}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-card">
        {/* Controls */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border bg-surface p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  status === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <UI.Select
              value={orderType}
              onValueChange={(v) => query.setMultiple({ orderType: v === "ALL" ? undefined : v, page: "1" })}
            >
              <UI.SelectTrigger className="h-9 w-[7.5rem]">
                <UI.SelectValue />
              </UI.SelectTrigger>
              <UI.SelectContent>
                {TYPES.map((t) => (
                  <UI.SelectItem key={t} value={t}>
                    {t === "ALL" ? "All types" : t.charAt(0) + t.slice(1).toLowerCase()}
                  </UI.SelectItem>
                ))}
              </UI.SelectContent>
            </UI.Select>
            <UI.TableSearchInput
              placeholder="Search order number..."
              className="sm:w-56"
              value={search ?? ""}
              onSearch={(text: string) => query.setMultiple({ search: text, page: "1" })}
            />
          </div>
        </div>

        {/* Table */}
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
                  <UI.TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <UI.TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</UI.TableCell>
                    ))}
                  </UI.TableRow>
                ))
              ) : isLoading ? (
                <UI.TableLoading rowCount={LIMIT} columnCount={columns.length} />
              ) : (
                <UI.TableRow>
                  <UI.TableCell colSpan={columns.length} className="h-24 text-center font-semibold">
                    No orders match your filters.
                  </UI.TableCell>
                </UI.TableRow>
              )}
            </UI.TableBody>
          </UI.Table>
        </div>

        <div className="flex justify-end p-4">
          <UI.PaginationBtns totalPages={data?.totalPages ?? 0} />
        </div>
      </div>
    </div>
  );
};
