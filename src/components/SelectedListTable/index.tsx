"use client";

import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { columns } from "./Columns";

interface DataTableProps<TData> {
  data: TData[];
}

export const SelectedListTable = <TData,>({ data }: DataTableProps<TData>) => {
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    columns: columns as ColumnDef<TData>[],
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  const { isOpen, closeModal } = useQueryModal([
    { key: "selected-tags", value: true },
  ]);

  React.useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed w-[34.7rem] pt-4 px-5 bg-background z-50 h-screen right-0 top-0 shadow-[0px_12px_16px_0px_#00000033] transition-transform duration-500 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center  justify-between">
        <UI.Button onClick={closeModal}>Close</UI.Button>
        <UI.TableSearchInput className="w-[15rem]" />
      </div>

      <div className="mt-7 pr-3   pb-32 pt-2 h-full overflow-y-auto scroll-bar">
        <UI.Table>
          <UI.TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <UI.TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <UI.TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </UI.TableHead>
                  );
                })}
              </UI.TableRow>
            ))}
          </UI.TableHeader>
          <UI.TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <UI.TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <UI.TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </UI.TableCell>
                  ))}
                </UI.TableRow>
              ))
            ) : (
              <UI.TableRow>
                <UI.TableCell
                  colSpan={columns.length}
                  className="h-24 text-center font-faktum-test font-semibold"
                >
                  No results.
                </UI.TableCell>
              </UI.TableRow>
            )}
          </UI.TableBody>
        </UI.Table>
      </div>
    </div>
  );
};
