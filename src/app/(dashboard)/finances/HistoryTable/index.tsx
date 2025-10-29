"use client";

import { UI } from "@/components/ui";
import { EmptyIcon } from "./EmptyIcon";
import { TableFilter } from "./Filter";
import { flexRender } from "@tanstack/react-table";
import { columns } from "./TableColumn";
import { useGetTransactionsReactTableQuery } from "@/api/queries/transaction";
import { useURLQuery } from "@/hooks";
import dayjs from "dayjs";

export const HistoryTable = () => {
  const LIMIT = 10;
  const query = useURLQuery();
  const page = Number(query.get("page") || 1);
  const status = query.get("status") || "all";
  const type = query.get("type") || "all";
  const category = query.get("category") || "all";
  const purpose = query.get("purpose") || "all";
  const timeframe = query.get("timeframe") || "all";
  const dateRange = {
    today: dayjs().format("YYYY-MM-DD"),
    last_7_days: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
    this_month: dayjs().startOf("month").format("YYYY-MM-DD"),
    last_30_days: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    last_90_days: dayjs().subtract(90, "day").format("YYYY-MM-DD"),
    last_180_days: dayjs().subtract(180, "day").format("YYYY-MM-DD"),
    this_year: dayjs().startOf("year").format("YYYY-MM-DD"),
    last_year: `${dayjs().subtract(1, "year").startOf("year").format("YYYY-MM-DD")},${dayjs()
      .subtract(1, "year")
      .endOf("year")
      .format("YYYY-MM-DD")}`,
    all: undefined,
  };
  const { table, data, isLoading, isRefetching } = useGetTransactionsReactTableQuery(columns, {
    limit: LIMIT,
    page,
    status: status === "all" ? undefined : status.toUpperCase(),
    type: type === "all" ? undefined : type.toUpperCase(),
    category: category === "all" ? undefined : category.toUpperCase(),
    purpose: purpose === "all" ? undefined : purpose.toUpperCase(),
    dateRange: timeframe === "all" ? undefined : dateRange[timeframe as keyof typeof dateRange],
  });

  return (
    <div className="mt-2 ">
      <div className="overflow-x-auto">
        <UI.Table>
          <UI.TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <UI.TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <UI.TableHead key={header.id} className="text-sm font-clash-display">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </UI.TableHead>
                  );
                })}
              </UI.TableRow>
            ))}
          </UI.TableHeader>
          <UI.TableBody>
            {isLoading || isRefetching ? (
              <UI.TableLoading rowCount={LIMIT} columnCount={columns.length} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <UI.TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <UI.TableCell key={cell.id} className="text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </UI.TableCell>
                  ))}
                </UI.TableRow>
              ))
            ) : (
              <UI.TableRow className="hover:bg-transparent">
                <UI.TableCell colSpan={columns.length} className="h-[20rem]">
                  <div className="grid place-items-center">
                    <EmptyIcon />
                  </div>
                </UI.TableCell>
              </UI.TableRow>
            )}
          </UI.TableBody>
        </UI.Table>
      </div>
      <div className="mt-12 flex items-center justify-between">
        <TableFilter />
        <UI.PaginationBtns totalPages={data?.totalPages || 0} />
      </div>
    </div>
  );
};
