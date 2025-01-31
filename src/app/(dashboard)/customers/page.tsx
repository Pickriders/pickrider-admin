"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

import { CustomersTable } from "./CustomersTable";
import { DeleteCustomersModal } from "./DeleteCustomersModal";
import { SuspendCustomersModal } from "./SuspendcustomersModal";
import { Suspense, useMemo } from "react";
import { useGetUsersQuery } from "@/api";
import { GetUsersParams } from "@/services";
import { CustomersTableBulkAction } from "./CustomersTableBulkAction";
import { CustomersTableFilter } from "./CustomersTableFilter";

const allowedStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"];

const Customers = ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const query = useMemo(() => {
    const page = searchParams.page ? Number(searchParams.page) : 1;
    const status = ((searchParams.status as string) || "").toUpperCase();

    const baseQuery: GetUsersParams = { page, limit: 5, role: "USER" };

    if (allowedStatuses.includes(status)) {
      baseQuery.status = status;
    }

    return baseQuery;
  }, [searchParams.page, searchParams.status]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Customer Management" />
        <UI.Button>
          <SVG.PlusIcon />
          Add Customer
        </UI.Button>
      </div>
      <section className="mt-[2rem] ">
        <div className="bg-background border rounded-lg pb-6 w-full">
          {/* TABLE Query components */}
          <div className="px-[1.4rem] py-5 flex items-center justify-between">
            <CustomersTableBulkAction />
            <div className="flex items-center gap-x-2">
              <Suspense>
                <UI.TableSearchInput />
                <CustomersTableFilter />
              </Suspense>
            </div>
          </div>
          {/* DATA TABLE */}
          <CustomersTable />
        </div>
      </section>

      {/* Modals */}
      <Suspense>
        <DeleteCustomersModal />
      </Suspense>
      <Suspense>
        <SuspendCustomersModal />
      </Suspense>
    </div>
  );
};
export default Customers;
