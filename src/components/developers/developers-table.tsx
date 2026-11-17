"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, CircleSlash, Inbox, Users } from "lucide-react";
import { useMemo } from "react";

import { DataTable, LinkButton, cx, type ColumnMeta, type FilterSpec } from "@/components/kit";
import type { DeveloperRow, Paged, Query } from "@/lib/admin/api";
import { ago, day, when } from "@/lib/admin/format";
import { useDevelopers } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { LIVE_STATUS, LiveStatusBadge, TeamAvatar, TeamSuspendedBadge, waited } from "./developer-ui";

export type DevelopersMode = "queue" | "all";
type Row = DeveloperRow & Record<string, unknown>;

const meta = (value: ColumnMeta) => value;

const LIVE_FILTER: FilterSpec = {
  key: "liveStatus",
  label: "Live access",
  options: Object.entries(LIVE_STATUS).map(([value, s]) => ({ value, label: s.label })),
};

/** The list endpoint's query for a tab and the table's URL state. Exported for the test. */
export function developersQuery(
  mode: DevelopersMode,
  state: { page: number; limit: number; search?: string; filters: Record<string, string> },
): Query {
  return {
    page: state.page,
    limit: state.limit,
    search: state.search,
    liveStatus: mode === "queue" ? "PENDING" : state.filters.liveStatus,
  };
}

function Ticks({ owner }: { owner: DeveloperRow["owner"] }) {
  if (!owner) return null;
  const tick = (ok: boolean, label: string) => (
    <span
      title={`${label} ${ok ? "verified" : "not verified"}`}
      className={cx("inline-flex items-center gap-0.5", ok ? "text-success" : "text-ink-faint")}
    >
      {ok ? <BadgeCheck size={11} aria-hidden /> : <CircleSlash size={11} aria-hidden />}
      {label}
    </span>
  );
  return (
    <span className="mt-0.5 flex gap-2 text-[10px] font-semibold">
      {tick(owner.emailVerified, "Email")}
      {tick(owner.phoneVerified, "Phone")}
    </span>
  );
}

function TeamCell({ team }: { team: DeveloperRow }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <TeamAvatar name={team.name} size={32} />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[13px] font-semibold text-ink">{team.name}</span>
        <span className="block truncate text-[11px] text-ink-muted">
          @{team.handle}
          {team.companyName && team.companyName !== team.name ? ` · ${team.companyName}` : ""}
        </span>
      </span>
    </span>
  );
}

function OwnerCell({ owner }: { owner: DeveloperRow["owner"] }) {
  if (!owner) return <span className="text-xs text-ink-faint">No owner</span>;
  return (
    <span className="block min-w-0 leading-tight">
      <span className="block truncate text-[13px] font-medium text-ink">{owner.name}</span>
      <span className="block truncate text-[11px] text-ink-muted">{owner.email}</span>
      <Ticks owner={owner} />
    </span>
  );
}

/** Where a team opens: its own page. */
export const teamHref = (teamId: string) => `/developers/${teamId}`;

function columns(mode: DevelopersMode): ColumnDef<Row, unknown>[] {
  return [
    {
      id: "team",
      header: "Team",
      meta: meta({ skeleton: "person", csv: { key: "name", label: "Team" } }),
      cell: ({ row }) => <TeamCell team={row.original} />,
    },
    {
      id: "owner",
      header: "Owner",
      meta: meta({
        hideBelow: "md",
        skeleton: "lines",
        csv: { key: "owner", label: "Owner email", value: (row) => (row as DeveloperRow).owner?.email ?? "" },
      }),
      cell: ({ row }) => <OwnerCell owner={row.original.owner} />,
    },
    {
      id: "live",
      header: "Live access",
      meta: meta({ skeleton: "badge", csv: { key: "liveStatus", label: "Live access" } }),
      cell: ({ row }) => (
        <span className="flex flex-col items-start gap-1">
          <LiveStatusBadge status={row.original.liveStatus} />
          <TeamSuspendedBadge team={row.original} />
        </span>
      ),
    },
    mode === "queue"
      ? {
          id: "waiting",
          header: "Waiting",
          meta: meta({ skeleton: "lines", csv: { key: "liveRequestedAt", label: "Requested at" } }),
          cell: ({ row }) => {
            const hours = row.original.liveRequestedAt
              ? (Date.now() - new Date(row.original.liveRequestedAt).getTime()) / 3_600_000
              : 0;
            return (
              <span className="leading-tight" title={when(row.original.liveRequestedAt)}>
                <span
                  className={cx(
                    "block text-[13px] font-semibold tabular-nums",
                    hours >= 24 ? "text-warning" : "text-ink",
                  )}
                >
                  {waited(row.original.liveRequestedAt)}
                </span>
                <span className="block text-[11px] text-ink-faint">since {day(row.original.liveRequestedAt)}</span>
              </span>
            );
          },
        }
      : {
          id: "created",
          header: "Signed up",
          meta: meta({ hideBelow: "lg", skeleton: "lines", csv: { key: "createdAt", label: "Signed up" } }),
          cell: ({ row }) => (
            <span className="text-[13px] text-ink-muted" title={when(row.original.createdAt)}>
              {ago(row.original.createdAt)}
            </span>
          ),
        },
    {
      id: "actions",
      header: "",
      meta: meta({ align: "right", width: "7rem", skeleton: "button" }),
      cell: ({ row }) => (
        <LinkButton size="sm" variant={mode === "queue" ? "primary" : "outline"} href={teamHref(row.original.id)}>
          {mode === "queue" ? "Review" : "Open"}
        </LinkButton>
      ),
    },
  ];
}

export function DevelopersTable({ mode }: { mode: DevelopersMode }) {
  const table = useTableState({ limit: 20 });
  const query = useMemo(() => developersQuery(mode, table.state), [mode, table.state]);
  const list = useDevelopers(query);
  const cols = useMemo(() => columns(mode), [mode]);

  return (
    <DataTable<Row>
      columns={cols}
      data={list.data as Paged<Row> | undefined}
      loading={list.isLoading || list.isFetching}
      error={list.isError ? errorMessage(list.error) : null}
      onRetry={() => void list.refetch()}
      searchPlaceholder="Team, handle, company or email"
      filters={mode === "all" ? [LIVE_FILTER] : []}
      csvName={mode === "queue" ? "developer-review-queue" : "developers"}
      rowHref={(row) => teamHref(row.id)}
      mobileCard={(row) => (
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <TeamCell team={row} />
            <LiveStatusBadge status={row.liveStatus} />
          </div>
          <OwnerCell owner={row.owner} />
          <p className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>
              {mode === "queue" ? `Waiting ${waited(row.liveRequestedAt)}` : `Signed up ${ago(row.createdAt)}`}
            </span>
            <TeamSuspendedBadge team={row} />
          </p>
        </div>
      )}
      emptyIcon={mode === "queue" ? Inbox : Users}
      emptyTitle={mode === "queue" ? "Nobody is waiting" : "No developer teams yet"}
      emptyDescription={
        mode === "queue"
          ? "When a developer asks for live access, they show up here, oldest first."
          : "Teams that sign up at dashboard.pickriders.com show up here."
      }
    />
  );
}
