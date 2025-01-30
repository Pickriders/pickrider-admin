"use client";

import { UI } from "@/components/ui";

import React, { Suspense } from "react";

import { CouriersTableBulkActions } from "./CouriersTableBulkActions";
import { CouriersTableFilter } from "./CouriersTableFilter";
import { DeleteCourierModal } from "./DeleteModal";
import { SuspendCourierModal } from "./SuspendModal";
import { DataTable } from "./DataTable";
import { ListUserResponseDto } from "@/services";

interface DataTableProps<TData> {
  data: ListUserResponseDto;
  isLoading: boolean;
}

export const CouriersTable = <TData,>({
  data,
  isLoading,
}: DataTableProps<TData>) => {
  const totalPages = data?.totalPages || 0;

  return (
    <div className="bg-background border rounded-lg pb-6 w-full">
      {/* Query components */}
      <div className="px-[1.4rem] py-5 flex items-center justify-between">
        <CouriersTableBulkActions />
        <div className="flex items-center gap-x-2">
          <UI.TableSearchInput />
          <CouriersTableFilter />
        </div>
      </div>

      {/* Data Table */}
      <div>
        <DataTable data={data} isLoading={isLoading} />
      </div>

      {/* Pagination */}
      <div className="mt-3 flex justify-end px-[1.5rem]">
        <Suspense>
          <UI.PaginationBtns totalPages={totalPages} />
        </Suspense>
      </div>

      {/* Modals */}
      <Suspense>
        <SuspendCourierModal />
        <DeleteCourierModal />
      </Suspense>
    </div>
  );
};
