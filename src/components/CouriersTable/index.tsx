"use client";

import { UI } from "@/components/ui";
import React, { Suspense } from "react";
import { CouriersTableBulkActions } from "./CouriersTableBulkActions";
import { CouriersTableFilter } from "./CouriersTableFilter";
import { DeleteCourierModal } from "./DeleteModal";
import { SuspendCourierModal } from "./SuspendModal";
import { DataTable } from "./DataTable";
import { useTableUrlFilter } from "@/hooks/useTableUrlFilter";
import { useURLQuery } from "@/hooks";

export const CouriersTable = () => {
  const query = useURLQuery();
  const userSearch = query.get("search");

  return (
    <div className="bg-background border rounded-lg pb-6 w-full">
      {/* Query components */}

      <div className="px-[1.4rem] py-5 flex items-center justify-between">
        <CouriersTableBulkActions />
        <div className="flex items-center gap-x-2">
          <Suspense>
            <UI.TableSearchInput
              value={userSearch ?? ""}
              onSearch={(text) => {
                query.set("search", text);
              }}
            />
            <CouriersTableFilter />
          </Suspense>
        </div>
      </div>

      {/* Data Table */}
      <div>
        <Suspense>
          <DataTable />
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
