"use client";

import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

import type { Order, User } from "@/lib/admin/api";
import { useOrders } from "@/lib/admin/hooks";
import { fullName, naira, statusLabel, time } from "@/lib/admin/format";
import { Badge, EmptyState, Panel, PanelHeader, Skeleton, statusTone } from "@/components/kit/primitives";

/** The latest orders across the platform, newest first, refreshed with the feed. */
const TYPE_LABEL: Record<string, string> = { SINGLE: "Single", BATCH: "Batch", BULK: "Bulk" };

function customerOf(order: Order): User | undefined {
  const user = (order as { user?: User }).user;
  if (user && typeof user === "object") return user;
  return order.userId && typeof order.userId === "object" ? order.userId : undefined;
}

export function RecentOrders({ limit = 8 }: { limit?: number }) {
  const orders = useOrders({ limit, order: "DESC" }, { poll: true });
  const rows = orders.data?.items ?? [];
  const loading = orders.isLoading && !orders.data;

  return (
    <Panel>
      <PanelHeader
        title="Recent orders"
        subtitle="The latest activity across the platform"
        action={
          <Link href="/orders" className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline">
            View all <ArrowRight size={13} />
          </Link>
        }
      />
      <div className="px-2 pb-2 pt-1">
        {loading ? (
          <div className="space-y-2 px-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : !rows.length ? (
          <EmptyState compact icon={Package} title="No orders yet" description="New orders show up here as customers place them." />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((order) => {
              const customer = customerOf(order);
              const name = fullName(customer);
              return (
                <li key={order._id}>
                  <Link href={`/orders/${order._id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-xs font-black text-ink-muted">
                      {TYPE_LABEL[order.type]?.[0] ?? "O"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        #{order.orderNumber ?? order._id.slice(-6)}
                        {name ? <span className="font-medium text-ink-muted"> · {name}</span> : null}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {TYPE_LABEL[order.type] ?? order.type} · {naira(order.totalAmountPayable)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                      <p className="mt-1 text-[11px] text-ink-faint">{time(order.createdAt)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Panel>
  );
}
