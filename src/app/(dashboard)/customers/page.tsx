"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

import { CustomersTable } from "./CustomersTable";
import { DeleteCustomersModal } from "./DeleteCustomersModal";
import { SuspendCustomersModal } from "./SuspendcustomersModal";
import { Suspense } from "react";
import { useGetUsersQuery } from "@/api";
import { GetUsersParams } from "@/services";
import { CustomersTableBulkAction } from "./CustomersTableBulkAction";
import { CustomersTableFilter } from "./CustomersTableFilter";

const allowedStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"];

const Customers = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const status = ((searchParams.status as string) || "").toUpperCase();

  let query: GetUsersParams = { page, limit: 5 };

  if (allowedStatuses.includes(status)) {
    query.status = status;
  }

  const { data, isLoading, error } = useGetUsersQuery(query);

  if (error) {
    return <div>Error loading customers: {error.message}</div>;
  }

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
          <CustomersTable data={data!} isLoading={isLoading} />
          {/* TABLE Pagination */}
          <div className="mt-3 flex justify-end px-[1.5rem]">
            <Suspense>
              <UI.PaginationBtns
                currentPage={data?.currentPage || 1}
                totalPages={data?.totalPages || 0}
              />
            </Suspense>
          </div>
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
