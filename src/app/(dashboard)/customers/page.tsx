"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

import { CustomersTable } from "./CustomersTable";
import { DeleteCustomersModal } from "./DeleteCustomersModal";
import { SuspendCustomersModal } from "./SuspendcustomersModal";
import { Suspense, useState } from "react";
import { useGetUsersQuery } from "@/api";
import { useRouter } from "next/navigation";
import { GetUsersParams } from "@/services";

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

  const customers =
    data?.results?.filter((user) => user.isRider === false) ?? [];

  console.log(data);

  const handlePageChange = (newPage: number) => {
    // setPage(newPage);
    // router.push(`/customers?page=${newPage}`, { scroll: false });
  };

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
          <CustomersTable
            allData={data!}
            data={customers}
            isLoading={isLoading}
            onPageChange={handlePageChange}
          />
          {/* Pagination */}
          <div className="mt-3 flex justify-end px-[1.5rem]">
            <UI.PaginationBtns
              currentPage={data?.currentPage || 1}
              totalPages={data?.totalPages || 0}
              onPageChange={handlePageChange}
            />
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
