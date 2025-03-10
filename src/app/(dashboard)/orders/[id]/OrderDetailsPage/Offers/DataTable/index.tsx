"use client";

import * as React from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { UI } from "@/components/ui";
import { columns } from "../columns";
import { Offer } from "@/services";

interface DataTableProps {
  offers: Offer[];
}

export const DataTable: React.FC<DataTableProps> = ({ offers }) => {
  const table = useReactTable({
    data: offers ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <>
      <div className="rounded-md  ">
        <UI.Table>
          <UI.TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <UI.TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-b ">
                  {row.getVisibleCells().map((cell) => (
                    <UI.TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </UI.TableCell>
                  ))}
                </UI.TableRow>
              ))
            ) : (
              <UI.TableRow>
                <UI.TableCell colSpan={columns.length} className="h-24 text-center font-montserrat">
                  No Offers.
                </UI.TableCell>
              </UI.TableRow>
            )}
          </UI.TableBody>
        </UI.Table>
      </div>
    </>
  );
};
