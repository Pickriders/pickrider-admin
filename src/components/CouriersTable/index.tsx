"use client";

import { UI } from "@/components/ui";
import React, { Suspense } from "react";
import { CouriersTableFilter } from "./CouriersTableFilter";
import { CouriersTableSort } from "./CouriersTableSort";
import { DeleteCourierModal } from "./DeleteModal";
import { SuspendCourierModal } from "./SuspendModal";
import { DataTable } from "./DataTable";
import { useURLQuery } from "@/hooks";

export const CouriersTable = () => {
  const query = useURLQuery();
  const userSearch = query.get("search");

  return (
    <div className="bg-background border rounded-lg pb-6 w-full">
      {/* Query components */}

      <div className="px-3 sm:px-[1.4rem] py-5 flex flex-wrap items-center gap-3 justify-between">
        <Suspense>
          <CouriersTableSort />
        </Suspense>
        <div className="flex flex-1 sm:flex-none items-center gap-x-2">
          <Suspense>
            <UI.TableSearchInput
              placeholder="Search name, phone or email..."
              className="sm:w-72"
              value={userSearch ?? ""}
              onSearch={(text) => {
                query.setMultiple({ search: text, page: "1" });
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
