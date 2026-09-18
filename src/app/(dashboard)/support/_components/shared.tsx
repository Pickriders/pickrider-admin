"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Avatar, Badge, type ColumnMeta, type Tone } from "@/components/kit";
import type { Issue, IssueCategory, IssuePriority, IssueStatus, Person } from "@/lib/admin/api";
import { ago, fullName, when } from "@/lib/admin/format";

/** Labels, tones and table columns shared by the support queue, detail page and customer tab. */
export const STATUS_LABEL: Record<IssueStatus, string> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};
export const STATUS_TONE: Record<IssueStatus, Tone> = {
  OPEN: "warning",
  IN_REVIEW: "info",
  RESOLVED: "success",
  CLOSED: "neutral",
};
export const PRIORITY_LABEL: Record<IssuePriority, string> = { HIGH: "High", MEDIUM: "Medium", LOW: "Low" };
export const PRIORITY_TONE: Record<IssuePriority, Tone> = { HIGH: "danger", MEDIUM: "warning", LOW: "neutral" };
export const CATEGORY_LABEL: Record<IssueCategory, string> = {
  ORDER: "Order",
  DELIVERY: "Delivery",
  RIDER_BEHAVIOUR: "Rider behaviour",
  APP_TECHNICAL: "App / technical",
  PAYMENT_REFUND: "Payment / refund",
  SAFETY_SECURITY: "Safety / security",
  OTHER: "Other",
};

export const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as IssueStatus[]).map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));
export const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABEL) as IssuePriority[]).map((value) => ({
  value,
  label: PRIORITY_LABEL[value],
}));
export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABEL) as IssueCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}));

/** Open/in-review reports older than this are flagged in the queue (matches the backend summary). */
export const OVERDUE_MS = 48 * 60 * 60 * 1000;

export function isOverdue(issue: Pick<Issue, "status" | "createdAt">) {
  return (
    (issue.status === "OPEN" || issue.status === "IN_REVIEW") &&
    Date.now() - new Date(issue.createdAt).getTime() > OVERDUE_MS
  );
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return <Badge tone={PRIORITY_TONE[priority]}>{PRIORITY_LABEL[priority]}</Badge>;
}

export function PersonCell({ person, fallback = "Unknown" }: { person?: Person | null; fallback?: string }) {
  if (!person) return <span className="text-sm text-ink-faint">{fallback}</span>;
  const name = fullName(person) || person.email || fallback;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar src={person.photo} name={name} size={28} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">{name}</span>
        <span className="block truncate text-[11px] text-ink-muted">{person.phone || person.email}</span>
      </span>
    </span>
  );
}

const meta = (value: ColumnMeta) => value;

export const ISSUE_COLUMNS: ColumnDef<Issue, unknown>[] = [
  {
    id: "reference",
    header: "Report",
    meta: meta({ csv: { key: "reference", label: "Reference" } }),
    cell: ({ row }) => (
      <span className="block max-w-[22rem]">
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-ink">{row.original.reference}</span>
          {isOverdue(row.original) ? <Badge tone="danger">Overdue</Badge> : null}
        </span>
        <span className="mt-0.5 block truncate text-xs text-ink-muted">{row.original.description}</span>
      </span>
    ),
  },
  {
    id: "user",
    header: "Customer",
    meta: meta({
      hideBelow: "md",
      csv: { key: "user", label: "Customer", value: (row) => fullName((row as Issue).user) },
    }),
    cell: ({ row }) => (
      <Link
        href={`/customers/${row.original.userId}`}
        onClick={(event) => event.stopPropagation()}
        className="block hover:underline"
      >
        <PersonCell person={row.original.user} />
      </Link>
    ),
  },
  {
    id: "category",
    header: "Category",
    meta: meta({ hideBelow: "lg", csv: { key: "category", label: "Category" } }),
    cell: ({ row }) => <Badge tone="neutral">{CATEGORY_LABEL[row.original.category] ?? row.original.category}</Badge>,
  },
  {
    id: "priority",
    header: "Priority",
    meta: meta({ sortKey: "priority", csv: { key: "priority", label: "Priority" } }),
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
  },
  {
    id: "status",
    header: "Status",
    meta: meta({ sortKey: "status", csv: { key: "status", label: "Status" } }),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "assignee",
    header: "Assignee",
    meta: meta({
      hideBelow: "xl",
      csv: { key: "assignee", label: "Assignee", value: (row) => fullName((row as Issue).assignee) },
    }),
    cell: ({ row }) =>
      row.original.assignee ? (
        <PersonCell person={row.original.assignee} />
      ) : (
        <span className="text-xs text-ink-faint">Unassigned</span>
      ),
  },
  {
    id: "createdAt",
    header: "Reported",
    meta: meta({ sortKey: "createdAt", align: "right", csv: { key: "createdAt", label: "Reported" } }),
    cell: ({ row }) => (
      <span className="block text-right">
        <span className="block whitespace-nowrap text-sm text-ink">{ago(row.original.createdAt)}</span>
        <span className="block whitespace-nowrap text-[11px] text-ink-muted">{when(row.original.createdAt)}</span>
      </span>
    ),
  },
];

export function IssueMobileCard({ issue }: { issue: Issue }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold text-ink">{issue.reference}</span>
        <StatusBadge status={issue.status} />
      </div>
      <p className="line-clamp-2 text-sm text-ink">{issue.description}</p>
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={issue.priority} />
        <Badge tone="neutral">{CATEGORY_LABEL[issue.category] ?? issue.category}</Badge>
        {isOverdue(issue) ? <Badge tone="danger">Overdue</Badge> : null}
        <span className="ml-auto text-[11px] text-ink-muted">{ago(issue.createdAt)}</span>
      </div>
      <PersonCell person={issue.user} />
    </div>
  );
}
