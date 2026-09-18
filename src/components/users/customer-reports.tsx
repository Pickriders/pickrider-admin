"use client";

import { LifeBuoy } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/kit";
import type { Issue, Paged } from "@/lib/admin/api";
import { useUserIssues } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { ISSUE_COLUMNS, IssueMobileCard, STATUS_OPTIONS } from "@/app/(dashboard)/support/_components/shared";

/** Every report this customer has filed; rows open in Support. */
export function CustomerReports({ userId, enabled = true }: { userId: string; enabled?: boolean }) {
  const table = useTableState();
  const query = useMemo(
    () => ({ page: table.state.page, limit: table.state.limit, status: table.state.filters.status }),
    [table.state.page, table.state.limit, table.state.filters.status],
  );
  const data = useUserIssues(userId, query, enabled);
  const columns = useMemo(() => ISSUE_COLUMNS.filter((column) => column.id !== "user"), []);

  return (
    <DataTable<Issue>
      columns={columns}
      data={data.data as Paged<Issue> | undefined}
      loading={data.isPending || data.isFetching}
      error={data.error ? errorMessage(data.error) : null}
      onRetry={() => void data.refetch()}
      searchable={false}
      dateFilter={false}
      filters={[{ key: "status", label: "Status", options: STATUS_OPTIONS }]}
      csvName={`customer-${userId}-reports`}
      rowHref={(row) => `/support/${row._id}`}
      mobileCard={(row) => <IssueMobileCard issue={row} />}
      emptyIcon={LifeBuoy}
      emptyTitle="No reports"
      emptyDescription="This customer has not reported an issue."
    />
  );
}
