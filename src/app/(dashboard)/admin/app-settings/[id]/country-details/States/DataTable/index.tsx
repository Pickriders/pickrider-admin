"use client";

import * as React from "react";
import { flexRender } from "@tanstack/react-table";

import { UI } from "@/components/ui";
import { useGetCountryStatesReactTableQuery } from "@/api";
import { columns } from "../columns";
import { useSearchParams } from "next/navigation";

const LIMIT = 10;

interface DataTableProps {
  countryId: string;
}

export const DataTable: React.FC<DataTableProps> = ({ countryId }) => {
  const { table, isLoading, data } = useGetCountryStatesReactTableQuery(countryId, columns);

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
            ) : isLoading ? (
              <UI.TableLoading columnCount={columns.length} rowCount={LIMIT} />
            ) : (
              <UI.TableRow>
                <UI.TableCell colSpan={columns.length} className="h-24 text-center font-montserrat">
                  No results.
                </UI.TableCell>
              </UI.TableRow>
            )}
          </UI.TableBody>
        </UI.Table>
      </div>

      {/* // Pagination
      <div className="mt-3 flex justify-end px-[1.5rem]">
        <React.Suspense>
          <UI.PaginationBtns totalPages={data?.totalPages ?? 0} />
        </React.Suspense>
      </div> */}
    </>
  );
};
