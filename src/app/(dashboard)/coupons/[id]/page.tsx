"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Ban, Pencil, Play, Receipt } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  ErrorState,
  KeyValue,
  PageHeader,
  Panel,
  PanelHeader,
  Skeleton,
  StatCard,
  StatGrid,
  type ColumnMeta,
} from "@/components/kit";
import { coupons, type Coupon, type CouponUsage, type Paged } from "@/lib/admin/api";
import { count, day, fullName, naira, when } from "@/lib/admin/format";
import { useAction, useCoupon, useCouponUsages } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { canManageCoupons, getAdminRoles } from "@/lib/admin-access";
import { useTableState } from "@/lib/admin/url-state";

import { CouponFormDrawer } from "../_components/coupon-form-drawer";
import { LifecycleBadge, UsageBar, discountLabel } from "../_components/shared";

/** One coupon: its terms, how it has performed, and every redemption (who, which order, how much). */
const meta = (value: ColumnMeta) => value;

const USAGE_COLUMNS: ColumnDef<CouponUsage, unknown>[] = [
  {
    id: "createdAt",
    header: "When",
    meta: meta({ csv: { key: "createdAt", label: "When" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{when(row.original.createdAt)}</span>,
  },
  {
    id: "user",
    header: "Customer",
    meta: meta({ csv: { key: "user", label: "Customer", value: (row) => fullName((row as CouponUsage).user) } }),
    cell: ({ row }) => (
      <Link
        href={`/customers/${row.original.userId}`}
        onClick={(event) => event.stopPropagation()}
        className="block hover:underline"
      >
        <span className="block text-sm font-semibold text-ink">
          {fullName(row.original.user) || row.original.user?.email || "Unknown"}
        </span>
        <span className="block text-[11px] text-ink-muted">{row.original.user?.phone || row.original.user?.email}</span>
      </Link>
    ),
  },
  {
    id: "order",
    header: "Order",
    meta: meta({
      hideBelow: "md",
      csv: { key: "order", label: "Order", value: (row) => (row as CouponUsage).order?.orderNumber },
    }),
    cell: ({ row }) =>
      row.original.order ? (
        <Link
          href={`/orders/${row.original.orderId}`}
          onClick={(event) => event.stopPropagation()}
          className="font-mono text-xs font-bold text-brand-dark hover:underline"
        >
          {row.original.order.orderNumber ?? row.original.orderId}
        </Link>
      ) : (
        <span className="text-xs text-ink-faint">—</span>
      ),
  },
  {
    id: "status",
    header: "Order status",
    meta: meta({
      hideBelow: "lg",
      csv: { key: "status", label: "Order status", value: (row) => (row as CouponUsage).order?.status },
    }),
    cell: ({ row }) => (row.original.order?.status ? <Badge tone="neutral">{row.original.order.status}</Badge> : null),
  },
  {
    id: "discount",
    header: "Discount",
    meta: meta({ align: "right", csv: { key: "discountAmount", label: "Discount (kobo)" } }),
    cell: ({ row }) => (
      <span className="block text-right">
        <span className="block text-sm font-semibold text-ink">{naira(row.original.discountAmount)}</span>
        {row.original.order?.totalAmountPayable != null ? (
          <span className="block text-[11px] text-ink-muted">paid {naira(row.original.order.totalAmountPayable)}</span>
        ) : null}
      </span>
    ),
  },
];

function CouponDetail({ id }: { id: string }) {
  const { data: coupon, isPending, error, refetch } = useCoupon(id);
  const canManage = canManageCoupons(getAdminRoles());
  const table = useTableState();
  const usages = useCouponUsages(
    id,
    useMemo(() => ({ page: table.state.page, limit: table.state.limit }), [table.state.page, table.state.limit]),
  );

  const [editing, setEditing] = useState(false);
  const [pausing, setPausing] = useState(false);
  const invalidate = [["coupon", id], "coupons"];
  const toggleActive = useAction((isActive: boolean) => coupons.update(id, { isActive }), {
    success: (_, isActive) =>
      isActive ? "Coupon resumed." : "Coupon paused. Nobody can redeem it until it is resumed.",
    invalidate,
    onSuccess: () => setPausing(false),
  });

  if (isPending) return <Skeleton className="h-96 w-full" />;
  if (error || !coupon)
    return <ErrorState message={error ? errorMessage(error) : "Coupon not found"} onRetry={() => void refetch()} />;

  const remaining = Math.max(0, coupon.limit - coupon.usageCount);
  const avg = coupon.usageCount ? coupon.discountTotal / coupon.usageCount : 0;

  return (
    <div>
      <PageHeader
        breadcrumb={
          <Link href="/coupons?tab=coupons" className="inline-flex items-center gap-1 hover:text-ink">
            <ArrowLeft size={12} /> Coupons
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{coupon.code}</span>
            <LifecycleBadge lifecycle={coupon.lifecycle} />
            {coupon.isReward ? <Badge tone="brand">Badge reward</Badge> : null}
          </span>
        }
        description={`${discountLabel(coupon)} · ${coupon.isGeneral ? "everyone" : coupon.groupNames.length ? `groups: ${coupon.groupNames.join(", ")}` : "targeted, no group yet"} · ${coupon.isOneTime ? "once per customer" : "repeatable"}`}
        actions={
          canManage && !coupon.isReward ? (
            <>
              <Button variant="outline" icon={Pencil} onClick={() => setEditing(true)}>
                Edit
              </Button>
              {coupon.isActive ? (
                <Button variant="danger" icon={Ban} onClick={() => setPausing(true)}>
                  Pause
                </Button>
              ) : (
                <Button
                  variant="success"
                  icon={Play}
                  onClick={() => toggleActive.mutate(true)}
                  loading={toggleActive.isPending}
                >
                  Resume
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      <div className="space-y-5">
        <StatGrid columns={4}>
          <StatCard
            label="Redeemed"
            value={<UsageBar used={coupon.usageCount} limit={coupon.limit} />}
            hint={`${count(remaining)} left`}
            tone="default"
          />
          <StatCard
            label="Discount given"
            value={naira(coupon.discountTotal)}
            hint={`${naira(avg)} average per use`}
            tone="brand"
          />
          <StatCard
            label="Customers"
            value={count(coupon.uniqueUsers)}
            hint={coupon.lastUsedAt ? `Last used ${when(coupon.lastUsedAt)}` : "Never used"}
          />
          <StatCard label="Expires" value={day(coupon.expirationDate)} hint={`Created ${day(coupon.createdAt)}`} />
        </StatGrid>

        <Panel>
          <PanelHeader title="Terms" />
          <div className="px-6 pb-5">
            <KeyValue
              columns={4}
              items={[
                { label: "Name", value: coupon.name },
                { label: "Description", value: coupon.description },
                { label: "Type", value: coupon.type === "PERCENTAGE" ? "Percentage" : "Fixed amount" },
                { label: "Value", value: discountLabel(coupon) },
                { label: "Currency", value: coupon.currency },
                {
                  label: "Audience",
                  value: coupon.isGeneral ? "Everyone" : `Groups: ${coupon.groupNames.join(", ") || "none"}`,
                },
                { label: "Per customer", value: coupon.isOneTime ? "Once" : "Unlimited" },
                { label: "Redemption limit", value: count(coupon.limit) },
              ]}
            />
          </div>
        </Panel>

        <DataTable<CouponUsage>
          columns={USAGE_COLUMNS}
          data={usages.data as Paged<CouponUsage> | undefined}
          loading={usages.isPending || usages.isFetching}
          error={usages.error ? errorMessage(usages.error) : null}
          onRetry={() => void usages.refetch()}
          dateFilter={false}
          searchable={false}
          csvName={`coupon-${coupon.code}-redemptions`}
          rowHref={(row) => `/orders/${row.orderId}`}
          emptyIcon={Receipt}
          emptyTitle="Not redeemed yet"
          emptyDescription="Each time a customer applies this coupon to an order it shows here."
        />
      </div>

      <CouponFormDrawer open={editing} onClose={() => setEditing(false)} coupon={coupon} />
      <ConfirmDialog
        open={pausing}
        onClose={() => setPausing(false)}
        onConfirm={() => toggleActive.mutate(false)}
        title={`Pause ${coupon.code}?`}
        description="Customers will not be able to apply it until you resume it. Redemptions already made are not affected."
        confirmLabel="Pause coupon"
        tone="danger"
        loading={toggleActive.isPending}
      />
    </div>
  );
}

export default function CouponPage() {
  const params = useParams<{ id: string }>();
  return <CouponDetail id={params.id} />;
}
