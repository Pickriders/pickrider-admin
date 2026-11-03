"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Banknote, Bike, Clock, Lock, Megaphone, Package, PauseCircle, ShieldCheck, Sparkles, Trophy, Wifi } from "lucide-react";
import { Suspense, useMemo } from "react";

import {
  Avatar,
  Badge,
  Chip,
  ChipBarSkeleton,
  ChipDivider,
  DataTable,
  DataTableSkeleton,
  LinkButton,
  MenuFilters,
  MenuSelect,
  PageHeader,
  ProfileCardSkeleton,
  cx,
  statusTone,
  type ColumnMeta,
  type FilterSpec,
} from "@/components/kit";
import { phoneLabel } from "@/components/users/user-actions";
import { LICENCE_LABEL, licenceTone } from "@/components/users/user-panels";
import type { KycStatus, User } from "@/lib/admin/api";
import { ago, count, day, fullName, naira, statusLabel } from "@/lib/admin/format";
import { useAttention, useUsers } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";
import { errorMessage } from "@/lib/admin/http";
import { formatEmail } from "@/lib/admin/person";

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
    key: "withdrawalRestricted",
    label: "Withdrawals",
    options: [
      { value: "true", label: "Restricted" },
      { value: "false", label: "Allowed" },
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
  { value: "completedDeliveries", label: "Deliveries", icon: Package },
  { value: "totalEarned", label: "Earned", icon: Banknote },
  { value: "deliveriesAndEarnings", label: "Deliveries + earned", icon: Trophy },
  { value: "lastLoginDate", label: "Last seen", icon: Clock },
  { value: "createdAt", label: "Newest", icon: Sparkles },
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
    meta: { width: "48px", skeleton: "line" } satisfies ColumnMeta,
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
            <p className="truncate text-xs text-ink-muted">{phoneLabel(u.phone) || formatEmail(u.email)}</p>
          </div>
        </div>
      );
    },
    meta: { skeleton: "profile", csv: { key: "name", label: "Name", value: (r) => fullName(r as User) } } satisfies ColumnMeta,
  },
  {
    id: "status",
    header: "Account",
    cell: ({ row }) => (
      <span className="flex flex-col items-start gap-1">
        <Badge tone={statusTone(row.original.status)} dot>
          {statusLabel(row.original.status)}
        </Badge>
        {row.original.withdrawalRestriction?.active ? (
          <Badge tone="warning">
            <Lock size={10} />
            Withdrawals paused
          </Badge>
        ) : null}
      </span>
    ),
    meta: { skeleton: "pill", csv: { key: "status", label: "Account" } } satisfies ColumnMeta,
  },
  {
    id: "licence",
    header: "Licence",
    cell: ({ row }) => <Badge tone={licenceTone(row.original.driversLicenseVerified)}>{shortLicence(row.original.driversLicenseVerified)}</Badge>,
    meta: { skeleton: "pill", csv: { key: "driversLicenseVerified", label: "Licence" } } satisfies ColumnMeta,
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
    meta: { hideBelow: "lg", skeleton: "pill", csv: { key: "dispatchPaused", label: "Dispatch paused" } } satisfies ColumnMeta,
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
        <p className="truncate text-xs text-ink-muted">{phoneLabel(row.phone) || formatEmail(row.email)}</p>
        <p className="mt-1 text-xs text-ink-faint">
          {count(row.completedDeliveries)} deliveries · {naira(row.totalEarned)} earned
          {row.dispatchPaused ? " · dispatch paused" : ""}
          {row.withdrawalRestriction?.active ? " · withdrawals paused" : ""}
        </p>
      </div>
    </div>
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
      withdrawalRestricted: state.filters.withdrawalRestricted,
      dateRange: table.query.dateRange,
    }),
    [state, table.query.dateRange],
  );
  const riders = useUsers(query);
  const columns = useMemo(() => buildColumns((state.page - 1) * state.limit), [state.page, state.limit]);
  const reviewing = state.filters.driversLicenseVerified === "SUBMITTED";
  const onlineOnly = state.filters.isOnline === "true";
  const pausedOnly = state.filters.dispatchPaused === "true";
  const restrictedOnly = state.filters.withdrawalRestricted === "true";
  const toReview = attention.data?.licencesAwaitingReview ?? 0;
  const pausedCount = attention.data?.ridersPausedFromDispatch ?? 0;

  const sortBy = (value: string) => table.update({ sortBy: value, order: "DESC" });
  const toggleReview = () => table.setFilter("driversLicenseVerified", reviewing ? undefined : "SUBMITTED");
  const toggleOnline = () => table.setFilter("isOnline", onlineOnly ? undefined : "true");
  const togglePaused = () => table.setFilter("dispatchPaused", pausedOnly ? undefined : "true");
  const toggleRestricted = () => table.setFilter("withdrawalRestricted", restrictedOnly ? undefined : "true");
  // Clear only what the quick filters set, so a licence or dispatch filter picked in the panel survives.
  const clearQuick = () =>
    table.update({
      driversLicenseVerified: reviewing ? undefined : state.filters.driversLicenseVerified,
      isOnline: onlineOnly ? undefined : state.filters.isOnline,
      dispatchPaused: pausedOnly ? undefined : state.filters.dispatchPaused,
      withdrawalRestricted: restrictedOnly ? undefined : state.filters.withdrawalRestricted,
    });

  return (
    <div className="space-y-3">
      {/* Phones and small tablets: two compact menus instead of wrapping chip rows. */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <MenuSelect label="Sort" title="Top by" value={state.sortBy} options={SORTS} onChange={sortBy} placeholder="Custom" />
        <MenuFilters
          title="Quick filters"
          align="end"
          onClear={clearQuick}
          toggles={[
            {
              id: "review",
              label: "Licences to review",
              icon: ShieldCheck,
              tone: "warning",
              count: toReview ? count(toReview) : undefined,
              active: reviewing,
              onToggle: toggleReview,
            },
            { id: "online", label: "Online now", icon: Wifi, active: onlineOnly, onToggle: toggleOnline },
            {
              id: "paused",
              label: "Paused from dispatch",
              icon: PauseCircle,
              tone: "warning",
              count: pausedCount ? count(pausedCount) : undefined,
              active: pausedOnly,
              onToggle: togglePaused,
            },
            { id: "restricted", label: "Withdrawals restricted", icon: Lock, tone: "warning", active: restrictedOnly, onToggle: toggleRestricted },
          ]}
        />
      </div>
      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <span className="mr-1 text-xs font-semibold text-ink-faint">Top by</span>
        {SORTS.map((s) => (
          <Chip key={s.value} active={state.sortBy === s.value} onClick={() => sortBy(s.value)}>
            {s.label}
          </Chip>
        ))}
        <ChipDivider />
        <Chip tone="warning" active={reviewing} onClick={toggleReview}>
          <ShieldCheck size={13} />
          Licences to review{toReview ? ` · ${count(toReview)}` : ""}
        </Chip>
        <Chip active={onlineOnly} onClick={toggleOnline}>
          <Wifi size={13} />
          Online now
        </Chip>
        <Chip tone="warning" active={pausedOnly} onClick={togglePaused}>
          <PauseCircle size={13} />
          Paused from dispatch{pausedCount ? ` · ${count(pausedCount)}` : ""}
        </Chip>
        <Chip tone="warning" active={restrictedOnly} onClick={toggleRestricted}>
          <Lock size={13} />
          Withdrawals restricted
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
        mobileCardSkeleton={<ProfileCardSkeleton />}
        toolbarExtra={
          <LinkButton href="/messaging?audience=RIDERS" variant="outline" size="md" icon={Megaphone}>
            <span>Message riders</span>
          </LinkButton>
        }
      />
    </div>
  );
}

/** Until the search params resolve: the Sort and Quick filters menus (chips from md) and the table. */
function CouriersListFallback() {
  const columns = buildColumns(0).map((column) => ({
    ...(column.meta as ColumnMeta),
    header: typeof column.header === "string" ? column.header : undefined,
  }));
  return (
    <div className="space-y-3" aria-busy="true">
      <ChipBarSkeleton chips={["w-24", "w-20", "w-36", "w-24", "w-24"]} filters={["w-36", "w-28", "w-40", "w-44"]} />
      <DataTableSkeleton
        columns={columns}
        mobileCard={<ProfileCardSkeleton />}
      />
    </div>
  );
}

export default function CouriersPage() {
  return (
    <div>
      <PageHeader title="Couriers" description="Riders ranked by what they deliver. Verify licences, pause dispatch and fix balances from here." />
      <Suspense fallback={<CouriersListFallback />}>
        <CouriersList />
      </Suspense>
    </div>
  );
}
