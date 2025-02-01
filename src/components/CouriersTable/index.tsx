"use client";

import { UI } from "@/components/ui";
import React, { Suspense } from "react";
import { CouriersTableBulkActions } from "./CouriersTableBulkActions";
import { CouriersTableFilter } from "./CouriersTableFilter";
import { DeleteCourierModal } from "./DeleteModal";
import { SuspendCourierModal } from "./SuspendModal";
import { DataTable } from "./DataTable";

export const CouriersTable = () => {
  return (
    <div className="bg-background border rounded-lg pb-6 w-full">
      {/* Query components */}

      <div className="px-[1.4rem] py-5 flex items-center justify-between">
        <CouriersTableBulkActions />
        <div className="flex items-center gap-x-2">
          <Suspense>
            {" "}
            <UI.TableSearchInput />
            <CouriersTableFilter />
          </Suspense>
        </div>
      </div>

      {/* Data Table */}
      <div>
        <DataTable />
      </div>

      {/* Modals */}
      <Suspense>
        <SuspendCourierModal />
        <DeleteCourierModal />
      </Suspense>
    </div>
  );
};
