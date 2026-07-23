"use client";

import * as React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft, BadgeCheck, Bike, Mail, Phone, ShieldCheck, SquarePen, Wallet } from "lucide-react";
import { UI } from "@/components/ui";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { useGetUserDetailsQuery } from "@/api/queries/user";
import {
  useGetCustomerTransactionsQuery,
  useGetCustomerWalletQuery,
} from "@/api/queries/customer";
import { useGetCourierDeliveriesQuery, useGetCourierDeliveryStatsQuery } from "@/api/queries/courier";
import { Order, Transaction } from "@/services";
import { UserActions } from "@/components/UserActions";

const TXN_STATUS_COLOR: Record<string, string> = {
  SUCCESS: "#32BA7C",
  PROCESSING: "#F2A93B",
  FAILED: "#FF5244",
  CANCELLED: "#FF5244",
};
const ORDER_STATUS_COLOR: Record<string, string> = {
  INITIATED: "#DBAD0E",
  ACCEPTED: "#2282C8",
  ON_GOING: "#3E7DF6",
  COMPLETED: "#32BA7C",
  CANCELLED: "#FF5244",
};
const ORDER_TYPE_LABEL: Record<string, string> = { SINGLE: "Single", BATCH: "Batch", BULK: "Bulk" };

const money = (v?: number, currency?: string) => formatMoney(subUnitToBaseUnit(v ?? 0), { currency });

const StatTile = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="rounded-2xl border bg-card p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {icon && <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-dark">{icon}</span>}
    </div>
    <p className="mt-2 font-clash-display text-2xl font-semibold text-foreground">{value}</p>
  </div>
);

const Pager = ({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) => (
  <div className="mt-4 flex items-center justify-end gap-3">
    <UI.Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
      Previous
    </UI.Button>
    <span className="text-xs font-semibold text-muted-foreground">
      {page} / {Math.max(totalPages, 1)}
    </span>
    <UI.Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
      Next
    </UI.Button>
  </div>
);

const OrderStatusBadge = ({ status }: { status: string }) => (
  <span
    className="rounded-full px-2.5 py-1 text-[11px] font-bold"
    style={{ color: ORDER_STATUS_COLOR[status] ?? "#64708a", backgroundColor: `${ORDER_STATUS_COLOR[status] ?? "#64708a"}1a` }}
  >
    {status}
  </span>
);

const ActivityRow = ({ color, title, subtitle }: { color: string; title: string; subtitle: string }) => (
  <div className="flex items-start gap-3">
    <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

export const CourierDetail = ({ id }: { id: string }) => {
  const [tab, setTab] = React.useState<"transactions" | "deliveries" | "activity">("transactions");
  const [txnPage, setTxnPage] = React.useState(1);
  const [deliveryPage, setDeliveryPage] = React.useState(1);
  const [activityPage, setActivityPage] = React.useState(1);
  const ACTIVITY_PER_PAGE = 8;

  const { data: user } = useGetUserDetailsQuery(id);
  const { data: walletData } = useGetCustomerWalletQuery(id);
  const { data: stats } = useGetCourierDeliveryStatsQuery(id);
  const { data: txns } = useGetCustomerTransactionsQuery(id, txnPage);
  const { data: deliveries } = useGetCourierDeliveriesQuery(id, deliveryPage);
  const { data: recentTxns } = useGetCustomerTransactionsQuery(id, 1, 25);
  const { data: recentDeliveries } = useGetCourierDeliveriesQuery(id, 1, 25);

  const wallet = walletData?.results?.[0];
  const currency = wallet?.currency;
  const fullName = user ? `${user.firstname} ${user.lastname}` : "Courier";
  const initials = user ? `${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}` : "";
  const licenceApproved = user?.driversLicenseVerified === "APPROVE";

  type ActivityItem =
    | { kind: "login"; date: string }
    | { kind: "txn"; date: string; data: Transaction }
    | { kind: "order"; date: string; data: Order };

  const activity = React.useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    if (user?.lastLoginDate) items.push({ kind: "login", date: user.lastLoginDate });
    (recentTxns?.results ?? []).forEach((x) => items.push({ kind: "txn", date: x.createdAt, data: x as Transaction }));
    (recentDeliveries?.results ?? []).forEach((x) => items.push({ kind: "order", date: x.createdAt, data: x as Order }));
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [recentTxns, recentDeliveries, user?.lastLoginDate]);

  const activityTotalPages = Math.max(1, Math.ceil(activity.length / ACTIVITY_PER_PAGE));
  const activityItems = activity.slice((activityPage - 1) * ACTIVITY_PER_PAGE, activityPage * ACTIVITY_PER_PAGE);

  return (
    <div>
      <Link
        href="/couriers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to couriers
      </Link>

      <div className="mt-4 rounded-2xl border bg-card p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary-black text-xl font-semibold uppercase text-white">
              {user?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photo} alt={fullName} className="size-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-clash-display text-xl font-semibold text-foreground">{fullName}</h1>
                {user?.status && <UI.TableStatus status={user.status} />}
                <span
                  className={
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                    (licenceApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")
                  }
                >
                  <BadgeCheck size={11} />
                  {licenceApproved ? "Licence verified" : "Licence pending"}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} /> +{user.phone}
                  </span>
                )}
                {user?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} /> {user.email}
                  </span>
                )}
                <span>Joined {dayjs(user?.createdAt).format("DD MMM YYYY")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <UI.Button variant="outline" asChild>
                <Link href="verification" className="flex items-center gap-1.5">
                  <ShieldCheck size={15} /> Verification
                </Link>
              </UI.Button>
              <UI.Button variant="outline" asChild>
                <Link href="edit" className="flex items-center gap-1.5">
                  <SquarePen size={15} /> Edit
                </Link>
              </UI.Button>
            </div>
            <UserActions
              userId={id}
              status={user?.status}
              orders={[]}
              currency={currency}
              showRefund={false}
              balanceLabel="courier's earnings wallet"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Earnings balance" value={money(wallet?.balance, currency)} icon={<Wallet size={16} />} />
        <StatTile label="Deliveries completed" value={stats?.completed ?? 0} icon={<Bike size={16} />} />
        <StatTile label="Total deliveries" value={stats?.total ?? 0} />
        <StatTile label="Cancelled" value={stats?.cancelled ?? 0} />
      </div>

      <div className="mt-6 flex w-fit items-center gap-1 rounded-xl border bg-card p-1">
        {(["transactions", "deliveries", "activity"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              "rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors " +
              (tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border bg-card p-5">
        {tab === "transactions" && (
          <>
            <div className="overflow-x-auto">
              <UI.Table>
                <UI.TableHeader>
                  <UI.TableRow>
                    <UI.TableHead>Reference</UI.TableHead>
                    <UI.TableHead>Purpose</UI.TableHead>
                    <UI.TableHead>Type</UI.TableHead>
                    <UI.TableHead>Amount</UI.TableHead>
                    <UI.TableHead>Balance after</UI.TableHead>
                    <UI.TableHead>Status</UI.TableHead>
                    <UI.TableHead>Date</UI.TableHead>
                  </UI.TableRow>
                </UI.TableHeader>
                <UI.TableBody>
                  {txns?.results?.length ? (
                    txns.results.map((tx) => (
                      <UI.TableRow key={tx._id}>
                        <UI.TableCell className="font-semibold">{tx.reference || "—"}</UI.TableCell>
                        <UI.TableCell className="text-nowrap">{tx.purpose?.replaceAll("_", " ")}</UI.TableCell>
                        <UI.TableCell>
                          <span className={tx.type === "CREDIT" ? "text-emerald-600" : "text-red-500"}>{tx.type}</span>
                        </UI.TableCell>
                        <UI.TableCell className="font-semibold">{money(tx.amount, tx.currency)}</UI.TableCell>
                        <UI.TableCell>{money(tx.balanceAfter, tx.currency)}</UI.TableCell>
                        <UI.TableCell>
                          <span style={{ color: TXN_STATUS_COLOR[tx.status] }} className="font-semibold">
                            {tx.status}
                          </span>
                        </UI.TableCell>
                        <UI.TableCell className="text-nowrap">{dayjs(tx.createdAt).format("DD/MM/YY HH:mm")}</UI.TableCell>
                      </UI.TableRow>
                    ))
                  ) : (
                    <UI.TableRow>
                      <UI.TableCell colSpan={7} className="h-24 text-center font-semibold">
                        No transactions.
                      </UI.TableCell>
                    </UI.TableRow>
                  )}
                </UI.TableBody>
              </UI.Table>
            </div>
            <Pager page={txnPage} totalPages={txns?.totalPages ?? 1} onPage={setTxnPage} />
          </>
        )}

        {tab === "deliveries" && (
          <>
            <div className="overflow-x-auto">
              <UI.Table>
                <UI.TableHeader>
                  <UI.TableRow>
                    <UI.TableHead>Order</UI.TableHead>
                    <UI.TableHead>Type</UI.TableHead>
                    <UI.TableHead>Amount</UI.TableHead>
                    <UI.TableHead>Status</UI.TableHead>
                    <UI.TableHead>Date</UI.TableHead>
                    <UI.TableHead />
                  </UI.TableRow>
                </UI.TableHeader>
                <UI.TableBody>
                  {deliveries?.results?.length ? (
                    deliveries.results.map((o) => (
                      <UI.TableRow key={o._id}>
                        <UI.TableCell className="font-semibold">#{o.orderNumber}</UI.TableCell>
                        <UI.TableCell>{ORDER_TYPE_LABEL[o.type] ?? o.type}</UI.TableCell>
                        <UI.TableCell className="font-semibold">{money(o.totalAmountPayable, o.currency)}</UI.TableCell>
                        <UI.TableCell>
                          <OrderStatusBadge status={o.status} />
                        </UI.TableCell>
                        <UI.TableCell className="text-nowrap">{dayjs(o.createdAt).format("DD/MM/YY HH:mm")}</UI.TableCell>
                        <UI.TableCell>
                          <Link href={`/orders/${o._id}`} className="text-xs font-bold text-primary hover:underline">
                            View
                          </Link>
                        </UI.TableCell>
                      </UI.TableRow>
                    ))
                  ) : (
                    <UI.TableRow>
                      <UI.TableCell colSpan={6} className="h-24 text-center font-semibold">
                        No deliveries.
                      </UI.TableCell>
                    </UI.TableRow>
                  )}
                </UI.TableBody>
              </UI.Table>
            </div>
            <Pager page={deliveryPage} totalPages={deliveries?.totalPages ?? 1} onPage={setDeliveryPage} />
          </>
        )}

        {tab === "activity" &&
          (activity.length ? (
            <>
              <div className="space-y-4">
                {activityItems.map((item, i) =>
                  item.kind === "login" ? (
                    <ActivityRow
                      key={`l-${i}`}
                      color="#0284C7"
                      title="Last login"
                      subtitle={dayjs(item.date).format("DD MMM YYYY, HH:mm")}
                    />
                  ) : item.kind === "txn" ? (
                    <ActivityRow
                      key={`t-${item.data._id}-${i}`}
                      color={item.data.type === "CREDIT" ? "#32BA7C" : "#FF5244"}
                      title={`${item.data.type === "CREDIT" ? "Earning / credit" : "Debit"} — ${item.data.purpose?.replaceAll("_", " ")}`}
                      subtitle={`${money(item.data.amount, item.data.currency)} · ${dayjs(item.date).format("DD MMM YYYY, HH:mm")}`}
                    />
                  ) : (
                    <ActivityRow
                      key={`o-${item.data._id}-${i}`}
                      color="#7C3AED"
                      title={`Delivery #${item.data.orderNumber} — ${item.data.status}`}
                      subtitle={`${money(item.data.totalAmountPayable, item.data.currency)} · ${dayjs(item.date).format("DD MMM YYYY, HH:mm")}`}
                    />
                  ),
                )}
              </div>
              <Pager page={activityPage} totalPages={activityTotalPages} onPage={setActivityPage} />
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
          ))}
      </div>
    </div>
  );
};
