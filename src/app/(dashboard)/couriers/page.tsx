import { Suspense } from "react";
import { CouriersTable } from "@/components/CouriersTable";

const CouriersPage = () => {
  return (
    <div>
      <div>
        <h1 className="font-clash-display text-2xl font-semibold text-foreground">Couriers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review rider balances and deliveries, verify licences, and resolve rider issues.
        </p>
      </div>
      <section className="mt-6 w-full">
        <Suspense>
          <CouriersTable />
        </Suspense>
      </section>
    </div>
  );
};

export default CouriersPage;
