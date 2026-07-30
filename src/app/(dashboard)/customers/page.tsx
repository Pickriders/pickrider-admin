"use client";

import { CustomersTable } from "./CustomersTable";
import { DeleteCustomersModal } from "./DeleteCustomersModal";
import { SuspendCustomersModal } from "./SuspendcustomersModal";
import { Suspense } from "react";

const Customers = () => {
  return (
    <div>
      <div>
        <h1 className="font-clash-display text-2xl font-semibold text-foreground">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search, review balances and orders, and resolve customer issues.
        </p>
      </div>
      <section className="mt-6 ">
        <div className="bg-background border rounded-lg pb-6 w-full">
          {/* DATA TABLE */}
          <Suspense>
            <CustomersTable />
          </Suspense>
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
