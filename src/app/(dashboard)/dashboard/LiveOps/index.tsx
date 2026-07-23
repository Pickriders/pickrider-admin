"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Bike, Clock, PackageX, UserX } from "lucide-react";
import { useGetLiveOpsQuery, useGetRecentOrdersFeedQuery } from "@/api/queries/analytics";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { User } from "@/services";

const ORDER_STATUS_COLOR: Record<string, string> = {
  INITIATED: "#DBAD0E",
  ACCEPTED: "#2282C8",
  ON_GOING: "#3E7DF6",
  COMPLETED: "#32BA7C",
  CANCELLED: "#FF5244",
};
const ORDER_TYPE_LABEL: Record<string, string> = { SINGLE: "Single", BATCH: "Batch", BULK: "Bulk" };

const LiveTile = ({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  accent: string;
}) => (
  <div className="rounded-2xl border bg-card p-5">
    <div className="flex items-center justify-between">
      <span className="grid size-9 place-items-center rounded-xl" style={{ backgroundColor: `${accent}1a`, color: accent }}>
        {icon}
      </span>
      <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
        <span className="relative flex size-2">
          <span
            className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: accent }}
          />
          <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: accent }} />
        </span>
        live
      </span>
    </div>
    <p className="mt-3 font-clash-display text-2xl font-semibold text-foreground">{value.toLocaleString()}</p>
    <p className="text-xs font-medium text-foreground">{label}</p>
    <p className="text-[11px] text-muted-foreground">{hint}</p>
  </div>
);

export const LiveOps = () => {
  const { data: ops } = useGetLiveOpsQuery();
  const { data: feed } = useGetRecentOrdersFeedQuery(8);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 className="font-clash-display text-lg font-semibold text-foreground">Live operations</h2>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-dark">
          auto-refresh
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <LiveTile
          label="Ongoing deliveries"
          value={ops?.ongoing ?? 0}
          hint="Riders currently en route"
          icon={<Bike size={17} />}
          accent="#3E7DF6"
        />
        <LiveTile
          label="Awaiting a rider"
          value={ops?.awaiting ?? 0}
          hint="No rider has taken these yet"
          icon={<UserX size={17} />}
          accent="#DBAD0E"
        />
        <LiveTile
          label="Accepted"
          value={ops?.accepted ?? 0}
          hint="Rider assigned, not started"
          icon={<Clock size={17} />}
          accent="#3FA49F"
        />
        <LiveTile
          label="Cancelled today"
          value={ops?.cancelledToday ?? 0}
          hint="Missed / cancelled since midnight"
          icon={<PackageX size={17} />}
          accent="#FF5244"
        />
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-clash-display font-semibold text-foreground">Recent orders</h3>
            <p className="text-xs text-muted-foreground">The latest activity across the platform</p>
          </div>
          <Link href="/orders" className="text-xs font-bold text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="divide-y">
          {feed?.results?.length ? (
            feed.results.map((order) => {
              const user = order.user as User | undefined;
              const color = ORDER_STATUS_COLOR[order.status] ?? "#64708a";
              return (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/40"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                    {ORDER_TYPE_LABEL[order.type]?.[0] ?? "O"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      #{order.orderNumber}
                      {user ? ` · ${user.firstname} ${user.lastname}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ORDER_TYPE_LABEL[order.type] ?? order.type} ·{" "}
                      {formatMoney(subUnitToBaseUnit(order.totalAmountPayable ?? 0), { currency: order.currency })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                      style={{ color, backgroundColor: `${color}1a` }}
                    >
                      {order.status}
                    </span>
                    <p className="mt-1 text-[11px] text-muted-foreground">{dayjs(order.createdAt).format("HH:mm")}</p>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No recent orders.</p>
          )}
        </div>
      </div>
    </div>
  );
};
