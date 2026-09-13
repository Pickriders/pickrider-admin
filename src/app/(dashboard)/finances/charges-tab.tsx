"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Bike, CircleDollarSign, ExternalLink, Percent, Receipt, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { RiderChargeRow, Transaction } from "@/lib/admin/api";
import { useCharges, useRiderCharges, useTransactions } from "@/lib/admin/hooks";
import { ago, count, fullName, naira, nairaCompact, percent, trend, when } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Drawer,
  Pager,
  RangeTabs,
  Skeleton,
  StatCard,
  StatGrid,
  Tabs,
  cx,
  presetRange,
  rangeToQuery,
  type ColumnMeta,
  type RangeValue,
} from "@/components/kit";
import { purposeLabel } from "./lib";

/**
 * What the platform keeps from trips. Two legs land in the platform wallet on
 * every completed trip: the commission taken from the rider's earning and the
 * service charge the customer paid. "By rider" reads the commission off each
 * rider's earning rows; "History" is the platform-side ledger of both legs.
 */
const meta = (m: ColumnMeta) => m;

function riderName(row: RiderChargeRow) {
  if (row.entityType === "BUSINESS") return row.business?.name || "Business";
  return fullName(row.rider) || "Rider";
}

function riderHref(row: RiderChargeRow) {
  return row.entityType === "BUSINESS" ? `/business/${row.entityId}` : `/couriers/${row.entityId}/details`;
}

function orderIdOf(tx: Transaction) {
  const id = (tx.metadata as { orderId?: unknown } | undefined)?.orderId;
  return typeof id === "string" ? id : id != null ? String(id) : undefined;
}

export function ChargesTab() {
  const [range, setRange] = useState<RangeValue>(() => presetRange(30));
  const query = useMemo(() => rangeToQuery(range), [range]);
  const charges = useCharges(query);
  const cur = charges.data?.current;
  const prev = charges.data?.previous;
  const loading = charges.isLoading && !charges.data;
  const [view, setView] = useState<"riders" | "history">("riders");
  const table = useTableState({ limit: 20 });

  const commissionRate = cur && cur.trips ? Math.round((cur.tripsCharged / cur.trips) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-black tracking-tight text-ink">Charges</h2>
          <p className="text-xs text-ink-muted">What the platform keeps from every trip. In naira, Lagos time.</p>
        </div>
        <RangeTabs value={range} onChange={setRange} />
      </div>

      <StatGrid columns={4}>
        <StatCard
          tone="brand"
          label="Made from charges"
          value={loading ? "" : nairaCompact(cur?.total)}
          hint={loading ? "" : `${nairaCompact(cur?.riderCommission)} from riders, ${nairaCompact(cur?.serviceCharge)} from customers`}
          trend={cur && prev ? trend(cur.total, prev.total) : null}
          icon={CircleDollarSign}
          loading={loading}
        />
        <StatCard
          label="Rider commission"
          value={loading ? "" : nairaCompact(cur?.riderCommission)}
          hint={loading ? "" : `Taken on ${count(cur?.tripsCharged)} of ${count(cur?.trips)} paid trips (${commissionRate}%)`}
          trend={cur && prev ? trend(cur.riderCommission, prev.riderCommission) : null}
          icon={Percent}
          loading={loading}
        />
        <StatCard
          label="Service charges"
          value={loading ? "" : nairaCompact(cur?.serviceCharge)}
          hint={loading ? "" : `Paid by customers on ${count(cur?.serviceChargeCount)} orders`}
          trend={cur && prev ? trend(cur.serviceCharge, prev.serviceCharge) : null}
          icon={Receipt}
          loading={loading}
        />
        <StatCard
          label="Average per trip"
          value={loading ? "" : naira(cur?.averageCommission)}
          hint={loading ? "" : `Commission across ${count(cur?.ridersCharged)} riders charged`}
          trend={cur && prev ? trend(cur.averageCommission, prev.averageCommission) : null}
          icon={Bike}
          loading={loading}
        />
      </StatGrid>

      <Tabs
        value={view}
        onChange={(next) => {
          setView(next);
          table.update({ page: undefined, search: undefined, sortBy: undefined, order: undefined });
        }}
        items={[
          { id: "riders", label: "By rider" },
          { id: "history", label: "History" },
        ]}
      />

      {view === "riders" ? <RidersTable query={query} /> : <HistoryTable query={query} />}
    </div>
  );
}

function RidersTable({ query }: { query: ReturnType<typeof rangeToQuery> }) {
  const table = useTableState({ limit: 20 });
  const [selected, setSelected] = useState<RiderChargeRow | null>(null);
  const { dateRange: _ignored, ...rest } = table.query as Record<string, unknown> & { dateRange?: string };
  void _ignored;
  const data = useRiderCharges({ ...(rest as Record<string, string | number | undefined>), ...query, search: table.state.search });

  const columns = useMemo<ColumnDef<RiderChargeRow, unknown>[]>(
    () => [
      {
        id: "rider",
        header: "Rider",
        cell: ({ row }) => {
          const r = row.original;
          const name = riderName(r);
          return (
            <span className="flex min-w-0 items-center gap-3">
              <Avatar src={r.rider?.photo ?? r.business?.logo} name={name} size={34} />
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-ink">{name}</span>
                  {r.entityType === "BUSINESS" ? <Badge tone="info">Business</Badge> : r.rider?.isOnline ? <Badge tone="success" dot>Online</Badge> : null}
                </span>
                <span className="block truncate text-xs text-ink-muted">{r.rider?.phone ?? r.business?.phone ?? ""}</span>
              </span>
            </span>
          );
        },
        meta: meta({ csv: { key: "name", label: "Rider", value: (row) => riderName(row as RiderChargeRow) } }),
      },
      {
        id: "trips",
        header: "Paid trips",
        accessorKey: "trips",
        cell: ({ row }) => <span className="font-semibold tabular-nums text-ink">{count(row.original.trips)}</span>,
        meta: meta({ sortKey: "trips", align: "right", csv: { key: "trips", label: "Paid trips" } }),
      },
      {
        id: "earned",
        header: "Earned",
        cell: ({ row }) => <span className="tabular-nums text-ink">{naira(row.original.earned)}</span>,
        meta: meta({ sortKey: "earned", align: "right", hideBelow: "md", csv: { key: "earned", label: "Earned (kobo)" } }),
      },
      {
        id: "charges",
        header: "Commission",
        cell: ({ row }) => <span className="font-black tabular-nums text-brand-dark">{naira(row.original.charges)}</span>,
        meta: meta({ sortKey: "charges", align: "right", csv: { key: "charges", label: "Commission (kobo)" } }),
      },
      {
        id: "rate",
        header: "Rate",
        cell: ({ row }) => <span className="text-xs tabular-nums text-ink-muted">{row.original.earned ? percent((row.original.charges / row.original.earned) * 100) : "0%"}</span>,
        meta: meta({ align: "right", hideBelow: "lg" }),
      },
      {
        id: "last",
        header: "Last trip",
        cell: ({ row }) => <span className="text-xs text-ink-muted">{ago(row.original.lastAt)}</span>,
        meta: meta({ sortKey: "last", align: "right", hideBelow: "md", csv: { key: "lastAt", label: "Last trip" } }),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data.data}
        loading={data.isLoading || data.isFetching}
        error={data.error ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        searchPlaceholder="Search rider name, phone or business"
        dateFilter={false}
        csvName="rider-charges"
        defaultSort={{ sortBy: "charges", order: "DESC" }}
        emptyIcon={Users}
        emptyTitle="No commission taken in this window"
        emptyDescription="Riders show up here once a completed trip pays out with a charge on it."
        onRowClick={(row) => setSelected(row)}
        mobileCard={(row) => (
          <div className="flex items-center gap-3">
            <Avatar src={row.rider?.photo ?? row.business?.logo} name={riderName(row)} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{riderName(row)}</p>
              <p className="text-xs text-ink-muted">
                {count(row.trips)} trips · earned {nairaCompact(row.earned)}
              </p>
            </div>
            <p className="text-sm font-black text-brand-dark">{nairaCompact(row.charges)}</p>
          </div>
        )}
      />
      <RiderChargesDrawer row={selected} query={query} onClose={() => setSelected(null)} />
    </>
  );
}

/** One rider's paid trips in the window, with the commission taken on each. */
function RiderChargesDrawer({ row, query, onClose }: { row: RiderChargeRow | null; query: ReturnType<typeof rangeToQuery>; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const dateRange = "all" in query ? undefined : [query.from, query.to].filter(Boolean).join(",") || undefined;
  const history = useTransactions(
    { entityId: row?.entityId, purpose: "ORDER_EARNING", status: "SUCCESS", order: "DESC", page, limit: 10, dateRange },
    Boolean(row),
  );
  const rows = history.data?.items ?? [];

  return (
    <Drawer
      open={Boolean(row)}
      onClose={() => {
        setPage(1);
        onClose();
      }}
      title={row ? riderName(row) : ""}
      subtitle={row ? `${count(row.trips)} paid trips, ${naira(row.charges)} commission taken in this window` : ""}
      width="md"
      footer={
        row ? (
          <div className="flex items-center justify-between gap-3">
            <Link href={riderHref(row)} className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline">
              Open profile <ExternalLink size={12} />
            </Link>
            <Pager page={page} totalPages={history.data?.totalPages ?? 1} onPage={setPage} />
          </div>
        ) : null
      }
    >
      {row ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Figure label="Earned" value={nairaCompact(row.earned)} />
            <Figure label="Commission" value={nairaCompact(row.charges)} tone="text-brand-dark" />
            <Figure label="Rate" value={row.earned ? percent((row.charges / row.earned) * 100) : "0%"} />
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Charge history</p>
            {history.isLoading && !history.data ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : !rows.length ? (
              <p className="rounded-xl bg-surface px-4 py-6 text-center text-xs text-ink-muted">No paid trips in this window.</p>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border border-line">
                {rows.map((tx) => {
                  const orderId = orderIdOf(tx);
                  return (
                    <li key={tx._id} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          Trip paid {naira(tx.amount)}
                          {orderId ? (
                            <Link href={`/orders/${orderId}`} className="ml-2 text-xs font-bold text-brand-dark hover:underline">
                              View order
                            </Link>
                          ) : null}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {when(tx.createdAt)}
                          {tx.reference ? <span className="font-mono text-ink-faint"> · {tx.reference}</span> : null}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cx("text-sm font-black tabular-nums", tx.charge ? "text-brand-dark" : "text-ink-faint")}>{tx.charge ? `-${naira(tx.charge)}` : "No charge"}</p>
                        <p className="text-[11px] text-ink-faint">rider kept {naira((tx.amount ?? 0) - (tx.charge ?? 0))}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2.5">
      <p className="text-[11px] font-semibold text-ink-muted">{label}</p>
      <p className={cx("mt-0.5 truncate text-base font-black tabular-nums", tone ?? "text-ink")}>{value}</p>
    </div>
  );
}

/** The platform wallet's own charge ledger: both legs, newest first. */
function HistoryTable({ query }: { query: ReturnType<typeof rangeToQuery> }) {
  const table = useTableState({ limit: 20 });
  const dateRange = "all" in query ? undefined : [query.from, query.to].filter(Boolean).join(",") || undefined;
  const purpose = table.state.filters.purpose || "ORDER_EARNING_SPLIT,ORDER_SERVICE_CHARGE";
  const data = useTransactions({ ...table.query, dateRange, purpose, status: "SUCCESS" });

  const columns = useMemo<ColumnDef<Transaction, unknown>[]>(
    () => [
      {
        id: "when",
        header: "When",
        cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink">{when(row.original.createdAt)}</span>,
        meta: meta({ csv: { key: "createdAt", label: "When" } }),
      },
      {
        id: "purpose",
        header: "Charge",
        cell: ({ row }) => (
          <Badge tone={row.original.purpose === "ORDER_SERVICE_CHARGE" ? "info" : "brand"}>
            {row.original.purpose === "ORDER_SERVICE_CHARGE" ? "Customer service charge" : "Rider commission"}
          </Badge>
        ),
        meta: meta({ csv: { key: "purpose", label: "Purpose", value: (row) => purposeLabel((row as Transaction).purpose) } }),
      },
      {
        id: "order",
        header: "Order",
        cell: ({ row }) => {
          const orderId = orderIdOf(row.original);
          return orderId ? (
            <Link href={`/orders/${orderId}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline">
              View order <ExternalLink size={11} />
            </Link>
          ) : (
            <span className="text-xs text-ink-faint">Not linked</span>
          );
        },
        meta: meta({ hideBelow: "md" }),
      },
      {
        id: "reference",
        header: "Reference",
        cell: ({ row }) => <span className="font-mono text-xs text-ink-muted">{row.original.reference ?? ""}</span>,
        meta: meta({ hideBelow: "lg", csv: { key: "reference", label: "Reference" } }),
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="font-black tabular-nums text-success">+{naira(row.original.amount)}</span>,
        meta: meta({ align: "right", csv: { key: "amount", label: "Amount (kobo)" } }),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data.data}
      loading={data.isLoading || data.isFetching}
      error={data.error ? errorMessage(data.error) : null}
      onRetry={() => void data.refetch()}
      searchPlaceholder="Search is not available on this ledger"
      dateFilter={false}
      csvName="platform-charges"
      filters={[
        {
          key: "purpose",
          label: "Charge type",
          options: [
            { value: "ORDER_EARNING_SPLIT", label: "Rider commission" },
            { value: "ORDER_SERVICE_CHARGE", label: "Customer service charge" },
          ],
        },
      ]}
      emptyIcon={Receipt}
      emptyTitle="No charges in this window"
      emptyDescription="Charges land here as trips complete and pay out."
      toolbarExtra={
        <Button variant="ghost" size="sm" onClick={() => table.clear()} disabled={!table.activeFilterCount}>
          Reset
        </Button>
      }
      mobileCard={(row) => (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{row.purpose === "ORDER_SERVICE_CHARGE" ? "Customer service charge" : "Rider commission"}</p>
            <p className="text-xs text-ink-muted">{when(row.createdAt)}</p>
          </div>
          <p className="text-sm font-black text-success">+{naira(row.amount)}</p>
        </div>
      )}
    />
  );
}
