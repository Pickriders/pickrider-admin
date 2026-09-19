"use client";

import { LifeBuoy } from "lucide-react";
import { useMemo } from "react";

import { DataTable, cx } from "@/components/kit";
import type { Issue, IssuesSummary, Paged } from "@/lib/admin/api";
import { useIssues, useIssuesSummary, useMe } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { CATEGORY_OPTIONS, ISSUE_COLUMNS, IssueMobileCard, PRIORITY_OPTIONS, STATUS_OPTIONS } from "./shared";

/**
 * The support queue. Chips above the table are the views an agent works from: everything still
 * open, what nobody has picked up, what's mine, what's urgent, and the closed history. The `view`
 * param drives them; the table's own filters narrow further.
 */
const OPEN = "OPEN,IN_REVIEW";
const CHIPS: { id: string; label: string; count?: (s?: IssuesSummary) => number | undefined }[] = [
  { id: "open", label: "Needs attention", count: (s) => (s ? s.open + s.inReview : undefined) },
  { id: "unassigned", label: "Unassigned", count: (s) => s?.unassigned },
  { id: "mine", label: "Assigned to me" },
  { id: "high", label: "High priority", count: (s) => s?.highPriorityOpen },
  { id: "overdue", label: "Overdue", count: (s) => s?.overdue },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
];

export function QueueTab() {
  const table = useTableState({ sortBy: "createdAt", order: "DESC" });
  const summary = useIssuesSummary();
  const me = useMe();
  const view = table.state.filters.view ?? "open";

  const query = useMemo(() => {
    const { view: _view, ...filters } = table.state.filters;
    void _view;
    const { page, limit, sortBy, order } = table.query;
    const overdueBefore = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const byView: Record<string, Record<string, string | undefined>> = {
      open: { status: OPEN },
      unassigned: { status: OPEN, assignedTo: "unassigned" },
      mine: { status: OPEN, assignedTo: me.data?._id },
      high: { status: OPEN, priority: "HIGH" },
      overdue: { status: OPEN, to: overdueBefore, sortBy: "createdAt", order: "ASC" },
      resolved: { status: "RESOLVED" },
      closed: { status: "CLOSED" },
    };
    return {
      page,
      limit,
      sortBy,
      order,
      search: table.state.search,
      from: table.state.from,
      to: table.state.to,
      ...byView[view],
      // An explicit status/priority filter from the toolbar beats the chip's default.
      ...filters,
    };
  }, [table.query, table.state.filters, table.state.search, table.state.from, table.state.to, view, me.data?._id]);

  const data = useIssues(query);

  return (
    <div>
      <div className="admin-scroll -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {CHIPS.map((chip) => {
          const active = view === chip.id;
          const count = chip.count?.(summary.data);
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() =>
                table.update({
                  view: chip.id === "open" ? undefined : chip.id,
                  status: undefined,
                  priority: undefined,
                  assignedTo: undefined,
                })
              }
              className={cx(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-transparent bg-ink text-card"
                  : "border-line bg-card text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {chip.label}
              {count != null && count > 0 ? (
                <span
                  className={cx(
                    "rounded-full px-1.5 text-[11px]",
                    active
                      ? "bg-card/20 text-card"
                      : chip.id === "overdue" || chip.id === "high"
                        ? "bg-danger-soft text-danger"
                        : "bg-warning-soft text-warning",
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <DataTable<Issue>
        columns={ISSUE_COLUMNS}
        data={data.data as Paged<Issue> | undefined}
        loading={data.isPending || data.isFetching}
        error={data.error ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        searchPlaceholder="Reference, customer name, email or phone"
        filters={[
          { key: "status", label: "Status", options: STATUS_OPTIONS },
          { key: "priority", label: "Priority", options: PRIORITY_OPTIONS },
          { key: "category", label: "Category", options: CATEGORY_OPTIONS },
          {
            key: "subjectType",
            label: "About",
            options: [
              { value: "ORDER", label: "An order" },
              { value: "TRANSACTION", label: "A transaction" },
              { value: "GENERAL", label: "General" },
            ],
          },
        ]}
        csvName="issue-reports"
        defaultSort={{ sortBy: "createdAt", order: "DESC" }}
        rowHref={(row) => `/support/${row._id}`}
        mobileCard={(row) => <IssueMobileCard issue={row} />}
        emptyIcon={LifeBuoy}
        emptyTitle={view === "open" ? "The queue is clear" : "Nothing here"}
        emptyDescription="Reports customers file from the app land here."
      />
    </div>
  );
}
