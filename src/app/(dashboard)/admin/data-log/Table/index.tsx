"use client";

import { UI } from "@/components/ui";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import React, { Suspense } from "react";
import { Filter } from "./Filter";
import JsonPreviewModal from "../JsonPreviewModal";
import { makeColumns } from "./Columns";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService, DataLog } from "@/services";
import dayjs from "dayjs";

const LIMIT = 10;

export function DataTable() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [preview, setPreview] = React.useState<DataLog | null>(null);

  // GET /datalogs returns every record unpaginated — page + search client-side.
  const { data, isLoading } = useApiQuery({
    queryKey: ["data-logs"],
    queryFn: () => apiService.getLogs(),
  });

  const filtered = React.useMemo(() => {
    const records = data?.records ?? [];
    if (!search) return records;
    const term = search.toLowerCase();
    return records.filter((log) => JSON.stringify(log).toLowerCase().includes(term));
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const pageRows = React.useMemo(
    () => filtered.slice((page - 1) * LIMIT, page * LIMIT),
    [filtered, page],
  );

  const columns = React.useMemo(() => makeColumns(setPreview), []);

  const table = useReactTable({
    data: pageRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {},
  });

  return (
    <div className="bg-background rounded-xl pb-4 border">
      <div className="px-3 sm:px-[1.4rem] py-5 flex flex-wrap items-center gap-x-1 gap-y-2 ">
        <UI.TableSearchInput
          onSearch={(text: string) => {
            setSearch(text);
            setPage(1);
          }}
        />
        <Filter />
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
              <UI.TableLoading rowCount={5} columnCount={columns.length} />
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

      {/* Pagination — client-side buttons since the endpoint has no paging */}
      <div className="mt-3 flex items-center gap-x-3 justify-end px-[1.5rem]">
        <UI.Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </UI.Button>
        <span className="text-xs font-montserrat font-semibold text-primary-gray">
          {page} / {totalPages}
        </span>
        <UI.Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </UI.Button>
      </div>

      <Suspense>
        <JsonPreviewModal
          code={JSON.stringify(preview?.data ?? preview ?? {}, null, 2)}
          title={
            preview
              ? `${preview.logType ?? "SYSTEM"} ${preview.level ?? "LOG"} on ${dayjs(preview.createdAt).format("DD MMM YYYY, HH:mm")}`
              : undefined
          }
        />
      </Suspense>
    </div>
  );
}
