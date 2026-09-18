"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Medal } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Avatar, Badge, DataTable, type ColumnMeta } from "@/components/kit";
import type { AchievementUnlock, Paged } from "@/lib/admin/api";
import { ago, day, fullName, naira, when } from "@/lib/admin/format";
import { useAchievementCatalogue, useAchievementUnlocks } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { CATEGORY_LABEL, RewardStateBadge } from "./shared";

const meta = (value: ColumnMeta) => value;

const COLUMNS: ColumnDef<AchievementUnlock, unknown>[] = [
  {
    id: "user",
    header: "Customer",
    meta: meta({ csv: { key: "user", label: "Customer", value: (row) => fullName((row as AchievementUnlock).user) } }),
    cell: ({ row }) => {
      const name = fullName(row.original.user) || row.original.user?.email || "Unknown";
      return (
        <Link
          href={`/customers/${row.original.userId}?tab=badges`}
          onClick={(event) => event.stopPropagation()}
          className="flex min-w-0 items-center gap-2 hover:underline"
        >
          <Avatar src={row.original.user?.photo} name={name} size={28} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{name}</span>
            <span className="block truncate text-[11px] text-ink-muted">
              {row.original.user?.phone || row.original.user?.email}
            </span>
          </span>
        </Link>
      );
    },
  },
  {
    id: "badge",
    header: "Badge",
    meta: meta({ csv: { key: "title", label: "Badge" } }),
    cell: ({ row }) => (
      <span className="block">
        <span className="block text-sm font-bold text-ink">{row.original.title}</span>
        <span className="block text-[11px] text-ink-muted">
          {CATEGORY_LABEL[row.original.category] ?? row.original.category}
        </span>
      </span>
    ),
  },
  {
    id: "unlockedAt",
    header: "Unlocked",
    meta: meta({ csv: { key: "unlockedAt", label: "Unlocked" } }),
    cell: ({ row }) => (
      <span className="block">
        <span className="block whitespace-nowrap text-sm text-ink">{ago(row.original.unlockedAt)}</span>
        <span className="block whitespace-nowrap text-[11px] text-ink-muted">{when(row.original.unlockedAt)}</span>
      </span>
    ),
  },
  {
    id: "seen",
    header: "Seen in app",
    meta: meta({ hideBelow: "lg", csv: { key: "acknowledgedAt", label: "Seen in app" } }),
    cell: ({ row }) =>
      row.original.acknowledgedAt ? <Badge tone="success">Yes</Badge> : <Badge tone="neutral">Not yet</Badge>,
  },
  {
    id: "reward",
    header: "Reward",
    meta: meta({ csv: { key: "couponCode", label: "Reward coupon" } }),
    cell: ({ row }) => (
      <span className="block">
        <RewardStateBadge state={row.original.rewardState} />
        {row.original.couponCode ? (
          <span className="mt-1 block font-mono text-[11px] text-ink-muted">
            {row.original.couponCode}
            {row.original.couponExpiresAt && row.original.rewardState === "ACTIVE"
              ? ` · until ${day(row.original.couponExpiresAt)}`
              : ""}
          </span>
        ) : null}
      </span>
    ),
  },
  {
    id: "discount",
    header: "Discount",
    meta: meta({ align: "right", hideBelow: "md", csv: { key: "discountAmount", label: "Discount (kobo)" } }),
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-ink">
        {row.original.discountAmount ? naira(row.original.discountAmount) : <span className="text-ink-faint">—</span>}
      </span>
    ),
  },
];

/** Every badge unlock, newest first: who, what, whether they noticed, and whether the reward got used. */
export function UnlocksTab() {
  const table = useTableState();
  const catalogue = useAchievementCatalogue();

  const query = useMemo(() => {
    const { page, limit } = table.query;
    return {
      page,
      limit,
      ...table.state.filters,
      search: table.state.search,
      from: table.state.from,
      to: table.state.to,
    };
  }, [table.query, table.state.filters, table.state.search, table.state.from, table.state.to]);
  const data = useAchievementUnlocks(query);

  return (
    <DataTable<AchievementUnlock>
      columns={COLUMNS}
      data={data.data as Paged<AchievementUnlock> | undefined}
      loading={data.isPending || data.isFetching}
      error={data.error ? errorMessage(data.error) : null}
      onRetry={() => void data.refetch()}
      searchPlaceholder="Customer name, email or phone"
      filters={[
        {
          key: "key",
          label: "Badge",
          options: (catalogue.data ?? []).map((row) => ({ value: row.key, label: row.title })),
        },
        {
          key: "reward",
          label: "Reward",
          options: [
            { value: "redeemed", label: "Redeemed" },
            { value: "unredeemed", label: "Unused, still valid" },
            { value: "expired", label: "Expired unused" },
          ],
        },
      ]}
      csvName="badge-unlocks"
      rowHref={(row) => `/customers/${row.userId}?tab=badges`}
      mobileCard={(row) => (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-ink">{row.title}</span>
            <RewardStateBadge state={row.rewardState} />
          </div>
          <p className="text-sm text-ink">{fullName(row.user) || row.user?.email}</p>
          <p className="text-[11px] text-ink-muted">
            {when(row.unlockedAt)}
            {row.couponCode ? ` · ${row.couponCode}` : ""}
          </p>
        </div>
      )}
      emptyIcon={Medal}
      emptyTitle="No unlocks yet"
      emptyDescription="Badges unlock as customers complete deliveries, fund wallets and refer friends."
    />
  );
}
