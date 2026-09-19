"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Bike, Megaphone, PauseCircle, ShieldCheck, Wifi } from "lucide-react";
import { Suspense, useMemo, type ReactNode } from "react";

import { Avatar, Badge, DataTable, LinkButton, PageHeader, Skeleton, cx, statusTone, type ColumnMeta, type FilterSpec } from "@/components/kit";
import { phoneLabel } from "@/components/users/user-actions";
import { LICENCE_LABEL, licenceTone } from "@/components/users/user-panels";
import type { KycStatus, User } from "@/lib/admin/api";
import { ago, count, day, fullName, naira, statusLabel } from "@/lib/admin/format";
import { useAttention, useUsers } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";
import { errorMessage } from "@/lib/admin/http";

/**
 * The rider leaderboard: GET admins/users?isRider=true with lifetime
 * deliveries and earnings on every row. Sorted by deliveries by default, with
 * quick chips for the other rankings and for licences waiting on review.
 */
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"].map((value) => ({ value, label: statusLabel(value) }));
const LICENCE_OPTIONS: { value: KycStatus; label: string }[] = [
  { value: "APPROVE", label: "Verified" },
  { value: "SUBMITTED", label: "Awaiting review" },
  { value: "PENDING", label: "Not submitted" },
  { value: "DISAPPROVE", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

const FILTERS: FilterSpec[] = [
  { key: "status", label: "Account", options: STATUS_OPTIONS },
  { key: "driversLicenseVerified", label: "Licence", options: LICENCE_OPTIONS },
  {
    key: "isOnline",
    label: "Online",
    options: [
      { value: "true", label: "Online now" },
      { value: "false", label: "Offline" },
    ],
  },
  {
    key: "dispatchPaused",
    label: "Dispatch",
    options: [
      { value: "true", label: "Paused" },
      { value: "false", label: "Ringing" },
    ],
  },
  {
    key: "bvnVerified",
    label: "BVN",
    options: [
      { value: "true", label: "Verified" },
      { value: "false", label: "Not verified" },
    ],
  },
];

const SORTS = [
  { value: "completedDeliveries", label: "Deliveries" },
  { value: "totalEarned", label: "Earned" },
  { value: "deliveriesAndEarnings", label: "Deliveries + earned" },
  { value: "lastLoginDate", label: "Last seen" },
  { value: "createdAt", label: "Newest" },
];

const MEDAL: Record<number, string> = {
  1: "bg-warning-soft text-warning",
  2: "bg-surface text-ink",
  3: "bg-brand-soft text-brand-dark",
};

function shortLicence(status: KycStatus | undefined) {
  return LICENCE_LABEL[status ?? "PENDING"].replace("Licence ", "").replace(/^\w/, (c) => c.toUpperCase());
}

/** Rank needs the page offset, so the columns are built per page. */
const buildColumns = (offset: number): ColumnDef<User, unknown>[] => [
  {
    id: "rank",
    header: "#",
    cell: ({ row }) => {
      const n = offset + row.index + 1;
      return <span className={cx("grid h-6 w-6 place-items-center rounded-full text-xs font-bold tabular-nums", MEDAL[n] ?? "text-ink-faint")}>{n}</span>;
    },
    meta: { width: "48px" } satisfies ColumnMeta,
  },
  {
    id: "rider",
    header: "Rider",
    cell: ({ row }) => {
      const u = row.original;
      const name = fullName(u) || "Unnamed";
      return (
        <div className="flex items-center gap-3">
          <span className="relative shrink-0">
            <Avatar src={u.photo} name={name} size={36} />
            <span
              className={cx("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card", u.isOnline ? "bg-success" : "bg-line-strong")}
              aria-label={u.isOnline ? "Online" : "Offline"}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{name}</p>
            <p className="truncate text-xs text-ink-muted">{phoneLabel(u.phone) || u.email}</p>
          </div>
        </div>
      );
    },
    meta: { csv: { key: "name", label: "Name", value: (r) => fullName(r as User) } } satisfies ColumnMeta,
  },
  {
    id: "status",
    header: "Account",
    cell: ({ row }) => (
      <Badge tone={statusTone(row.original.status)} dot>
        {statusLabel(row.original.status)}
      </Badge>
    ),
    meta: { csv: { key: "status", label: "Account" } } satisfies ColumnMeta,
  },
  {
    id: "licence",
    header: "Licence",
    cell: ({ row }) => <Badge tone={licenceTone(row.original.driversLicenseVerified)}>{shortLicence(row.original.driversLicenseVerified)}</Badge>,
    meta: { csv: { key: "driversLicenseVerified", label: "Licence" } } satisfies ColumnMeta,
  },
  {
    id: "dispatch",
    header: "Dispatch",
    cell: ({ row }) =>
      row.original.dispatchPaused ? (
        <Badge tone="warning" dot>
          Paused
        </Badge>
      ) : (
        <span className="text-xs text-ink-faint">Ringing</span>
      ),
    meta: { hideBelow: "lg", csv: { key: "dispatchPaused", label: "Dispatch paused" } } satisfies ColumnMeta,
  },
  {
    id: "deliveries",
    header: "Deliveries",
    cell: ({ row }) => <span className="font-semibold tabular-nums text-ink">{count(row.original.completedDeliveries)}</span>,
    meta: { sortKey: "completedDeliveries", align: "right", csv: { key: "completedDeliveries", label: "Deliveries" } } satisfies ColumnMeta,
  },
  {
    id: "earned",
    header: "Earned",
    cell: ({ row }) => <span className="font-semibold tabular-nums text-ink">{naira(row.original.totalEarned)}</span>,
    meta: { sortKey: "totalEarned", align: "right", csv: { key: "totalEarned", label: "Earned (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "lastLogin",
    header: "Last seen",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{row.original.lastLoginDate ? ago(row.original.lastLoginDate) : "Never"}</span>,
    meta: { sortKey: "lastLoginDate", hideBelow: "xl", csv: { key: "lastLoginDate", label: "Last login" } } satisfies ColumnMeta,
  },
  {
    id: "joined",
    header: "Joined",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{day(row.original.createdAt)}</span>,
    meta: { sortKey: "createdAt", hideBelow: "xl", csv: { key: "createdAt", label: "Joined" } } satisfies ColumnMeta,
  },
];

function RiderCard({ row }: { row: User }) {
  const name = fullName(row) || "Unnamed";
  return (
    <div className="flex items-start gap-3">
      <span className="relative shrink-0">
        <Avatar src={row.photo} name={name} size={40} />
        <span className={cx("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card", row.isOnline ? "bg-success" : "bg-line-strong")} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-ink">{name}</p>
          <Badge tone={licenceTone(row.driversLicenseVerified)}>{shortLicence(row.driversLicenseVerified)}</Badge>
        </div>
        <p className="truncate text-xs text-ink-muted">{phoneLabel(row.phone) || row.email}</p>
        <p className="mt-1 text-xs text-ink-faint">
          {count(row.completedDeliveries)} deliveries · {naira(row.totalEarned)} earned
          {row.dispatchPaused ? " · dispatch paused" : ""}
        </p>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, tone = "neutral" }: { active: boolean; onClick: () => void; children: ReactNode; tone?: "neutral" | "warning" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors",
        active ? "border-transparent bg-ink text-card" : tone === "warning" ? "border-transparent bg-warning-soft text-warning hover:brightness-95" : "border-line bg-card text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function CouriersList() {
  const table = useTableState({ limit: 20, sortBy: "completedDeliveries", order: "DESC" });
  const { state } = table;
  const attention = useAttention();
  const query = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      sortBy: state.sortBy,
      order: state.order,
      isRider: true,
      userSearch: state.search,
      status: state.filters.status,
      driversLicenseVerified: state.filters.driversLicenseVerified,
      isOnline: state.filters.isOnline,
      dispatchPaused: state.filters.dispatchPaused,
      bvnVerified: state.filters.bvnVerified,
      dateRange: table.query.dateRange,
    }),
    [state, table.query.dateRange],
  );
  const riders = useUsers(query);
  const columns = useMemo(() => buildColumns((state.page - 1) * state.limit), [state.page, state.limit]);
  const reviewing = state.filters.driversLicenseVerified === "SUBMITTED";
  const onlineOnly = state.filters.isOnline === "true";
  const pausedOnly = state.filters.dispatchPaused === "true";
  const toReview = attention.data?.licencesAwaitingReview ?? 0;
  const pausedCount = attention.data?.ridersPausedFromDispatch ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-ink-faint">Top by</span>
        {SORTS.map((s) => (
          <Chip key={s.value} active={state.sortBy === s.value} onClick={() => table.update({ sortBy: s.value, order: "DESC" })}>
            {s.label}
          </Chip>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        <Chip tone="warning" active={reviewing} onClick={() => table.setFilter("driversLicenseVerified", reviewing ? undefined : "SUBMITTED")}>
          <ShieldCheck size={13} />
          Licences to review{toReview ? ` · ${count(toReview)}` : ""}
        </Chip>
        <Chip active={onlineOnly} onClick={() => table.setFilter("isOnline", onlineOnly ? undefined : "true")}>
          <Wifi size={13} />
          Online now
        </Chip>
        <Chip tone="warning" active={pausedOnly} onClick={() => table.setFilter("dispatchPaused", pausedOnly ? undefined : "true")}>
          <PauseCircle size={13} />
          Paused from dispatch{pausedCount ? ` · ${count(pausedCount)}` : ""}
        </Chip>
      </div>
      <DataTable
        columns={columns}
        data={riders.data}
        loading={riders.isLoading}
        error={riders.error ? errorMessage(riders.error, "Could not load riders.") : null}
        onRetry={() => riders.refetch()}
        filters={FILTERS}
        searchPlaceholder="Name, phone, email or NIN"
        csvName="riders"
        defaultSort={{ sortBy: "completedDeliveries", order: "DESC" }}
        emptyIcon={Bike}
        emptyTitle={table.activeFilterCount ? "No riders match" : "No riders yet"}
        emptyDescription={table.activeFilterCount ? "Try clearing a filter or the search." : "Riders who sign up on the rider app appear here."}
        rowHref={(row) => `/couriers/${row._id}/details`}
        mobileCard={(row) => <RiderCard row={row} />}
        toolbarExtra={
          <LinkButton href="/messaging?audience=RIDERS" variant="outline" size="md" icon={Megaphone}>
            <span>Message riders</span>
          </LinkButton>
        }
      />
    </div>
  );
}

export default function CouriersPage() {
  return (
    <div>
      <PageHeader title="Couriers" description="Riders ranked by what they deliver. Verify licences, pause dispatch and fix balances from here." />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CouriersList />
      </Suspense>
    </div>
  );
}
