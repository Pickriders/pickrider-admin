"use client";

import { ArrowUpRight, Bike, Car, ClipboardList, Wallet, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { asArray, type BusinessDetail, type Order, type User, type Wallet as WalletShape } from "@/lib/admin/api";
import { count, fullName, maskAccount, naira, statusLabel, when } from "@/lib/admin/format";
import { useBusinessOrderStatistics, useBusinessOrders, useBusinessWallets } from "@/lib/admin/hooks";
import { Badge, Button, KeyValue, Panel, PanelHeader, Skeleton, StatCard, StatGrid, statusTone } from "@/components/kit";

import { BUSINESS_TYPE_LABEL, SERVICE_TYPE_LABEL, type BusinessTab } from "../BusinessDetail";

/**
 * The business at a glance: wallet, order totals, profile fields, the wallets
 * behind the balance and the last few orders. Every block loads on its own.
 */
function named(value: { name?: string } | string | undefined) {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.name;
}

function personName(value: string | User | null | undefined) {
  if (!value || typeof value === "string") return "";
  return fullName(value);
}

export function OverviewTab({
  businessId,
  business,
  loading,
  onTab,
}: {
  businessId: string;
  business: BusinessDetail | undefined;
  loading: boolean;
  onTab: (tab: BusinessTab) => void;
}) {
  const wallets = useBusinessWallets(businessId);
  const stats = useBusinessOrderStatistics(businessId);
  const recent = useBusinessOrders(businessId, { limit: 5, order: "DESC" });

  const walletList = asArray<WalletShape>(wallets.data);
  const balance = walletList.reduce((sum, w) => sum + (w.balance ?? 0), 0);
  const orders = recent.data?.items ?? [];
  const address = business?.address;
  const addressLine = address ? [address.name, address.landmark, address.lga, address.state, address.country].filter(Boolean).join(", ") : "";

  return (
    <div className="space-y-4">
      <StatGrid columns={4}>
        <StatCard
          label="Wallet balance"
          value={naira(balance)}
          tone="brand"
          icon={Wallet}
          loading={wallets.isPending}
          hint={walletList.length > 1 ? `Across ${walletList.length} wallets` : walletList[0]?.currency ?? "No wallet yet"}
        />
        <StatCard label="Orders" value={count(stats.data?.total)} icon={ClipboardList} loading={stats.isPending} hint="All time" onClick={() => onTab("orders")} />
        <StatCard label="Completed" value={count(stats.data?.completed)} icon={CheckCircle2} loading={stats.isPending} hint={stats.data?.total ? `${Math.round(((stats.data.completed ?? 0) / stats.data.total) * 100)}% of orders` : "No orders yet"} />
        <StatCard label="Cancelled" value={count(stats.data?.cancelled)} icon={XCircle} loading={stats.isPending} hint={stats.data ? `${count(stats.data.single)} single · ${count(stats.data.batch)} batch · ${count(stats.data.bulk)} bulk` : undefined} />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Profile" subtitle="As registered on the business app" />
            <div className="p-5 pt-3">
              {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : (
                <KeyValue
                  columns={2}
                  items={[
                    { label: "Name", value: business?.name },
                    { label: "Handle", value: business?.businessHandle ? `@${business.businessHandle}` : undefined },
                    { label: "Email", value: business?.email },
                    { label: "Phone", value: business?.phone },
                    { label: "Business type", value: business?.type ? BUSINESS_TYPE_LABEL[business.type] ?? business.type : undefined },
                    { label: "Service model", value: business?.businessType ? SERVICE_TYPE_LABEL[business.businessType] ?? business.businessType : undefined },
                    { label: "Branch", value: business?.branchName },
                    {
                      label: "Website",
                      value: business?.website ? (
                        <a href={business.website} target="_blank" rel="noreferrer" className="text-brand-dark hover:underline">
                          {business.website}
                        </a>
                      ) : undefined,
                    },
                    { label: "Webhook", value: business?.webhook ? <span className="font-mono text-xs">{business.webhook}</span> : undefined },
                    { label: "Location", value: [named(business?.city), named(business?.state), named(business?.country)].filter(Boolean).join(", ") || undefined },
                    { label: "Address", value: addressLine || undefined },
                    { label: "About", value: business?.aboutMe },
                    { label: "Joined", value: when(business?.createdAt) },
                    { label: "Last updated", value: business?.updatedAt ? when(business.updatedAt) : undefined },
                  ]}
                />
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Recent orders"
              subtitle="Latest five"
              action={
                <Button size="sm" variant="ghost" icon={ArrowUpRight} onClick={() => onTab("orders")}>
                  All orders
                </Button>
              }
            />
            <div className="px-5 pb-4 pt-3">
              {recent.isPending ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : orders.length ? (
                <ul className="divide-y divide-line">
                  {orders.map((order: Order) => (
                    <li key={order._id}>
                      <Link href={`/orders/${order._id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-surface">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">#{order.orderNumber ?? order._id.slice(-6)}</span>
                          <span className="block truncate text-xs text-ink-muted">
                            {order.type ? `${order.type.toLowerCase()} · ` : ""}
                            {personName(order.riderId) ? `Rider ${personName(order.riderId)} · ` : ""}
                            {when(order.createdAt)}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-semibold text-ink">{naira(order.totalAmountPayable)}</span>
                          <Badge tone={statusTone(order.status?.toLowerCase())}>{statusLabel(order.status)}</Badge>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-ink-muted">No orders placed by this business yet.</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Team" />
            <div className="grid grid-cols-2 gap-3 p-5 pt-3">
              <button type="button" onClick={() => onTab("couriers")} className="rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong">
                <span className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                  <Bike size={14} /> Couriers
                </span>
                <span className="mt-1 block text-2xl font-black text-ink">{loading ? <Skeleton className="h-7 w-10" /> : count(business?.users?.length)}</span>
              </button>
              <button type="button" onClick={() => onTab("vehicles")} className="rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong">
                <span className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                  <Car size={14} /> Vehicles
                </span>
                <span className="mt-1 block text-2xl font-black text-ink">{loading ? <Skeleton className="h-7 w-10" /> : count(business?.vehicles?.length)}</span>
              </button>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Wallets" subtitle="Balances in the business's name" />
            <div className="p-5 pt-3">
              {wallets.isPending ? (
                <Skeleton className="h-16 w-full" />
              ) : walletList.length ? (
                <ul className="space-y-3">
                  {walletList.map((wallet) => (
                    <li key={wallet._id} className="rounded-xl border border-line p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-lg font-black text-ink">{naira(wallet.balance)}</span>
                        <Badge tone={wallet.status && wallet.status !== "ACTIVE" ? "warning" : "success"}>{wallet.status?.toLowerCase() ?? "active"}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">
                        {wallet.currency ?? "NGN"}
                        {wallet.settlement?.bankName ? ` · ${wallet.settlement.bankName} ${maskAccount(wallet.settlement.accountNumber)}` : " · No settlement account"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-muted">No wallet has been created for this business yet.</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
