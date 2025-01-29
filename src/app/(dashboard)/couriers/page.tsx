"use client";

import { useGetUsersQuery } from "@/api";
import { CouriersTable } from "@/components/CouriersTable";
import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { GetUsersParams } from "@/services";
import { useMemo } from "react";

const CouriersPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const query = useMemo(() => {
    const page = searchParams.page ? Number(searchParams.page) : 1;
    const status = ((searchParams.status as string) || "").toUpperCase();

    const baseQuery: GetUsersParams = { page, limit: 5, role: "USER" };

    // if (allowedStatuses.includes(status)) {
    //   baseQuery.status = status;
    // }

    return baseQuery;
  }, [searchParams.page, searchParams.status]);

  const { data, isLoading, error } = useGetUsersQuery(query);

  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Courier Management" />
        <UI.Button>
          <SVG.PlusIcon />
          Add Driver
        </UI.Button>
      </div>
      <section className="mt-[2rem] w-full">
        <CouriersTable data={data} isLoading={isLoading} />
      </section>
    </div>
  );
};
export default CouriersPage;
