"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Coins,
  ExternalLink,
  Globe,
  Info,
  Landmark,
  Link2,
  Receipt,
  Undo2,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { ProviderFeeFlowKey, ProviderFeeFlowTotals, ProviderFeeRow, ProviderFees } from "@/lib/admin/api";
import { useProviderFeeRows, useProviderFees } from "@/lib/admin/hooks";
import { count, naira, nairaCompact, when } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";
import {
  BarsChart,
  Button,
  ChartCard,
  DataTable,
  DonutChart,
  Drawer,
  ErrorState,
  KeyValue,
  LinkButton,
  Panel,
  RangeTabs,
  ScrollRow,
  Select,
  Skeleton,
  Sparkline,
  cx,
  presetRange,
  rangeToQuery,
  type ColumnMeta,
  type RangeValue,
} from "@/components/kit";
import { PersonCard, PersonInline } from "@/components/users/person-card";
import { FLOW_META, chartPoints, feeShare, feeTrend, flowMeta, keptSplit, ratePercent } from "./provider-fees-lib";

/**
 * What Paystack takes. The headline is the Paystack fee total for the window (the FEE rows the
 * API books against the platform wallet), then what came in against what the platform kept, each
 * money flow on its own, the trend, and every fee row with whose money it was.
 */
const meta = (m: ColumnMeta) => m;

const FLOW_ICON: Record<ProviderFeeFlowKey, LucideIcon> = {
  WALLET_DEPOSIT: Wallet,
  ORDER_CARD_PAYMENT: Link2,
  WEB_ORDER_PAYMENT: Globe,
  WITHDRAWAL: Landmark,
  PLATFORM_PAYOUT: Building2,
  REFUND: Undo2,
};

function shortDay(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });
}

function windowLabel(range: RangeValue) {
  if (range.all) return "all time";
  if (range.preset && range.preset > 0) return `the last ${range.preset} days`;
  return "this window";
}

export function ProviderFeesTab() {
  const [range, setRange] = useState<RangeValue>(() => presetRange(30));
  const [flow, setFlow] = useState<ProviderFeeFlowKey | "">("");
  const rangeQuery = useMemo(() => rangeToQuery(range), [range]);
  const summary = useProviderFees({ ...rangeQuery, bucket: range.all ? "week" : "day" });
  const data = summary.data as ProviderFees | undefined;
  const loading = summary.isLoading && !data;

  const cur = data?.current;
  const prev = data?.previous;
  const points = useMemo(() => chartPoints(data?.series), [data?.series]);
  const hasFees = points.some((p) => Number(p.fees) > 0);

  const pickFlow = (next: ProviderFeeFlowKey) => {
    setFlow((current) => (current === next ? "" : next));
    if (typeof document !== "undefined") document.getElementById("provider-fee-rows")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const donut = useMemo(
    () =>
      (cur?.flows ?? [])
        .filter((f) => f.fees > 0)
        .map((f) => ({ name: flowMeta(f.flow).label, value: f.fees, color: flowMeta(f.flow).color })),
    [cur?.flows],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-black tracking-tight text-ink">Provider fees</h2>
          <p className="text-xs text-ink-muted">Exactly what Paystack takes from every payment, payout and refund. In naira, Lagos time.</p>
        </div>
        <RangeTabs value={range} onChange={setRange} />
      </div>

      {summary.isError && !data ? (
        <ErrorState message="Provider fees could not be loaded." onRetry={() => void summary.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-5">
            <FeesHero data={data} loading={loading} label={windowLabel(range)} className="lg:col-span-3" />
            <KeptPanel data={data} loading={loading} className="lg:col-span-2" />
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-ink">By money flow</h3>
                <p className="text-xs text-ink-muted">Tap a flow to see its fees below.</p>
              </div>
              {flow ? (
                <Button variant="ghost" size="sm" onClick={() => setFlow("")}>
                  <X size={14} /> Clear
                </Button>
              ) : null}
            </div>
            <ScrollRow className="-mx-1" innerClassName="px-1 pb-1" label="Money flows" peekKey="provider-fee-flows" activeSelector="">
              <div className="flex w-max gap-3 sm:grid sm:w-full sm:grid-cols-2 xl:grid-cols-3">
                {loading
                  ? FLOW_META.map((m) => <FlowCardSkeleton key={m.key} />)
                  : (cur?.flows ?? []).map((f) => (
                      <FlowCard
                        key={f.flow}
                        flow={f}
                        previous={prev?.flows.find((p) => p.flow === f.flow)}
                        totalFees={cur?.totals.fees ?? 0}
                        active={flow === f.flow}
                        onClick={() => pickFlow(f.flow as ProviderFeeFlowKey)}
                      />
                    ))}
              </div>
            </ScrollRow>
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard
                title="Fees over time"
                subtitle={range.all ? "Weekly, all time, by flow" : "Daily, by flow"}
                loading={loading}
                empty={!loading && !hasFees}
                height={300}
              >
                <BarsChart
                  data={points}
                  xKey="bucket"
                  stacked
                  yFormat="naira"
                  xFormat={shortDay}
                  series={FLOW_META.filter((m) => m.key !== "REFUND").map((m) => ({ key: m.key, label: m.label, color: m.color, format: "naira" as const }))}
                />
              </ChartCard>
            </div>
            <ChartCard title="Where the fees went" subtitle="Share of Paystack fees" loading={loading} empty={!loading && !donut.length} height={300}>
              <DonutChart data={donut} format="naira" centerLabel="Fees" centerValue={nairaCompact(cur?.totals.fees)} />
            </ChartCard>
          </div>
        </>
      )}

      <div id="provider-fee-rows" className="scroll-mt-24">
        <FeeRowsTable rangeQuery={rangeQuery} flow={flow} onFlow={setFlow} />
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function TrendChip({ current, previous, onDark }: { current: number; previous: number; onDark?: boolean }) {
  const t = feeTrend(current, previous);
  if (!t) return null;
  const Icon = t.value > 0 ? ArrowUpRight : t.value < 0 ? ArrowDownRight : null;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums",
        onDark
          ? "bg-white/15 text-white"
          : t.tone === "danger"
            ? "bg-danger-soft text-danger"
            : t.tone === "success"
              ? "bg-success-soft text-success"
              : "bg-surface text-ink-muted",
      )}
    >
      {Icon ? <Icon size={12} /> : null}
      {Math.abs(t.value)}%
    </span>
  );
}

function FeesHero({ data, loading, label, className }: { data?: ProviderFees; loading: boolean; label: string; className?: string }) {
  const totals = data?.current.totals;
  const prev = data?.previous.totals;
  const spark = useMemo(() => (data?.series ?? []).map((p) => ({ value: p.fees })), [data?.series]);
  return (
    <Panel className={cx("relative overflow-hidden border-transparent bg-gradient-to-br from-brand to-brand-dark p-6 text-white", className)}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white/75">Paystack fees, {label}</p>
          <div className="mt-3 text-[34px] font-black leading-none tracking-tight tabular-nums sm:text-[40px]">
            {loading ? <Skeleton className="h-9 w-40 bg-white/20" /> : naira(totals?.fees, 2)}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/75">
            {loading ? (
              <Skeleton className="h-4 w-48 bg-white/20" />
            ) : (
              <>
                <TrendChip current={totals?.fees ?? 0} previous={prev?.fees ?? 0} onDark />
                <span>
                  vs {naira(prev?.fees, 2)} the period before
                  {totals && prev && totals.fees > prev.fees ? ", more taken" : totals && prev && totals.fees < prev.fees ? ", less taken" : ""}
                </span>
              </>
            )}
          </div>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15">
          <Coins size={20} />
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2">
        <HeroFigure label="Effective rate" value={loading ? null : ratePercent(totals?.effectiveRate)} />
        <HeroFigure label="Through Paystack" value={loading ? null : nairaCompact(totals?.gross)} />
        <HeroFigure label="Fee rows" value={loading ? null : count(totals?.feeCount)} />
      </div>

      {!loading && spark.length > 1 ? (
        <div className="relative -mx-1 mt-4">
          <Sparkline data={spark} dataKey="value" color="rgba(255,255,255,0.85)" />
        </div>
      ) : null}
    </Panel>
  );
}

function HeroFigure({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0 rounded-xl bg-white/10 px-3 py-2.5">
      <p className="truncate text-[11px] font-semibold text-white/70">{label}</p>
      <div className="mt-0.5 truncate text-base font-black tabular-nums">{value === null ? <Skeleton className="mt-1 h-4 w-14 bg-white/20" /> : value}</div>
    </div>
  );
}

function KeptPanel({ data, loading, className }: { data?: ProviderFees; loading: boolean; className?: string }) {
  const t = data?.current.totals;
  const split = keptSplit(t?.moneyIn ?? 0, t?.moneyInFees ?? 0);
  const inRate = t && t.moneyIn ? (t.moneyInFees / t.moneyIn) * 100 : 0;
  return (
    <Panel className={cx("flex flex-col p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-ink">Money in vs kept</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Card and bank payments received, less Paystack&apos;s cut.</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark">
          <ArrowDownLeft size={18} />
        </span>
      </div>

      {loading ? (
        <div className="mt-5 space-y-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Received</p>
          <p className="mt-1 text-[28px] font-black leading-none tracking-tight tabular-nums text-ink">{naira(t?.moneyIn)}</p>

          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-surface" role="img" aria-label={`Kept ${split.kept}%, Paystack ${split.fees}%`}>
            <span className="h-full bg-success transition-[width] duration-500" style={{ width: `${split.kept}%` }} />
            <span className="h-full bg-danger transition-[width] duration-500" style={{ width: `${split.fees}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-success-soft px-3 py-2.5">
              <p className="text-[11px] font-semibold text-success">Kept</p>
              <p className="mt-0.5 truncate text-base font-black tabular-nums text-ink">{naira(t?.kept)}</p>
            </div>
            <div className="rounded-xl bg-danger-soft px-3 py-2.5">
              <p className="text-[11px] font-semibold text-danger">Paystack took</p>
              <p className="mt-0.5 truncate text-base font-black tabular-nums text-ink">
                {naira(t?.moneyInFees, 2)} <span className="text-xs font-semibold text-ink-muted">{ratePercent(inRate)}</span>
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5 text-xs">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <ArrowUpRight size={14} /> Sent out
              </span>
              <span className="text-right">
                <span className="font-bold tabular-nums text-ink">{naira(t?.moneyOut)}</span>
                <span className="text-ink-muted"> · fees </span>
                <span className="font-bold tabular-nums text-danger">{naira(t?.moneyOutFees, 2)}</span>
              </span>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

// ── Flow cards ───────────────────────────────────────────────────────────────

function FlowCard({
  flow,
  previous,
  totalFees,
  active,
  onClick,
}: {
  flow: ProviderFeeFlowTotals;
  previous?: ProviderFeeFlowTotals;
  totalFees: number;
  active: boolean;
  onClick: () => void;
}) {
  const m = flowMeta(flow.flow);
  const Icon = FLOW_ICON[m.key] ?? Receipt;
  const share = feeShare(flow, totalFees);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "group w-[264px] shrink-0 rounded-2xl border bg-card p-5 text-left transition-all sm:w-auto",
        active ? "border-brand shadow-pop ring-2 ring-brand/30" : "border-line hover:border-line-strong hover:shadow-pop",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `color-mix(in srgb, ${m.color} 16%, transparent)`, color: m.color }}>
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{m.label}</p>
            <p className="truncate text-[11px] text-ink-muted">{m.hint}</p>
          </div>
        </div>
        <span className={cx("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", m.direction === "in" ? "bg-success-soft text-success" : "bg-surface text-ink-muted")}>
          {m.direction === "in" ? "In" : "Out"}
        </span>
      </div>

      {flow.feesReported ? (
        <>
          <div className="mt-4 flex items-end justify-between gap-2">
            <p className="text-2xl font-black leading-none tracking-tight tabular-nums text-ink">{naira(flow.fees, 2)}</p>
            <TrendChip current={flow.fees} previous={previous?.fees ?? 0} />
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <span className="block h-full rounded-full" style={{ width: `${share}%`, backgroundColor: m.color }} />
          </div>
          <p className="mt-1.5 text-[11px] text-ink-faint">{share}% of all Paystack fees</p>
        </>
      ) : (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 text-[11px] leading-snug text-ink-muted">
          <Info size={14} className="mt-px shrink-0" />
          <span>Paystack reports no refund fee. The fee on the original payment is not returned and is counted there.</span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
        <FlowFigure label="Count" value={count(flow.count)} />
        <FlowFigure label="Gross" value={nairaCompact(flow.gross)} />
        <FlowFigure label="Rate" value={flow.feesReported ? ratePercent(flow.effectiveRate) : "n/a"} />
      </div>
    </button>
  );
}

function FlowFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-0.5 truncate font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function FlowCardSkeleton() {
  return (
    <div className="w-[264px] shrink-0 rounded-2xl border border-line bg-card p-5 sm:w-auto">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-40 max-w-full" />
        </div>
      </div>
      <Skeleton className="mt-4 h-6 w-28" />
      <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
      <Skeleton className="mt-2 h-2.5 w-24" />
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-2 w-10" />
            <Skeleton className="h-3.5 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fee rows ─────────────────────────────────────────────────────────────────

function FlowTag({ flow }: { flow: string }) {
  const m = flowMeta(flow);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-ink">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

function FeeRowsTable({
  rangeQuery,
  flow,
  onFlow,
}: {
  rangeQuery: ReturnType<typeof rangeToQuery>;
  flow: ProviderFeeFlowKey | "";
  onFlow: (flow: ProviderFeeFlowKey | "") => void;
}) {
  const table = useTableState({ limit: 20 });
  const [selected, setSelected] = useState<ProviderFeeRow | null>(null);
  // Only what this endpoint reads: other tabs' URL filters must not leak in.
  const data = useProviderFeeRows({ ...rangeQuery, page: table.state.page, limit: table.state.limit, flow: flow || undefined });

  const columns = useMemo<ColumnDef<ProviderFeeRow, unknown>[]>(
    () => [
      {
        id: "when",
        header: "When",
        cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink">{when(row.original.createdAt)}</span>,
        meta: meta({ skeleton: "line", csv: { key: "createdAt", label: "When" } }),
      },
      {
        id: "flow",
        header: "Flow",
        cell: ({ row }) => <FlowTag flow={row.original.flow} />,
        meta: meta({ skeleton: "badge", csv: { key: "flow", label: "Flow", value: (r) => flowMeta((r as ProviderFeeRow).flow).label } }),
      },
      {
        id: "person",
        header: "Whose money",
        cell: ({ row }) => <PersonInline person={row.original.owner} fallback="Not linked" />,
        meta: meta({ hideBelow: "md", skeleton: "person", csv: { key: "owner", label: "Whose money", value: (r) => (r as ProviderFeeRow).owner?.name ?? "" } }),
      },
      {
        id: "reference",
        header: "Reference",
        cell: ({ row }) => <span className="block max-w-[180px] truncate font-mono text-xs text-ink-muted">{row.original.reference}</span>,
        meta: meta({ hideBelow: "xl", skeleton: "line", csv: { key: "reference", label: "Reference" } }),
      },
      {
        id: "gross",
        header: "Gross",
        cell: ({ row }) => <span className="whitespace-nowrap tabular-nums text-ink">{row.original.gross != null ? naira(row.original.gross, 2) : "Not found"}</span>,
        meta: meta({ align: "right", hideBelow: "lg", skeleton: "line", csv: { key: "gross", label: "Gross (kobo)" } }),
      },
      {
        id: "fee",
        header: "Fee",
        cell: ({ row }) => <span className="whitespace-nowrap font-black tabular-nums text-danger">-{naira(row.original.fee, 2)}</span>,
        meta: meta({ align: "right", skeleton: "line", csv: { key: "fee", label: "Fee (kobo)" } }),
      },
      {
        id: "rate",
        header: "Rate",
        cell: ({ row }) => <span className="text-xs tabular-nums text-ink-muted">{row.original.effectiveRate != null ? ratePercent(row.original.effectiveRate) : ""}</span>,
        meta: meta({ align: "right", hideBelow: "lg", skeleton: "line", csv: { key: "effectiveRate", label: "Rate (%)" } }),
      },
    ],
    [],
  );

  return (
    <>
      <div className="mb-3">
        <h3 className="text-sm font-bold tracking-tight text-ink">Every fee</h3>
        <p className="text-xs text-ink-muted">Newest first, with the payment or transfer it was charged on.</p>
      </div>
      <DataTable
        columns={columns}
        data={data.data}
        loading={data.isLoading || data.isFetching}
        error={data.error ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        searchable={false}
        dateFilter={false}
        csvName="paystack-fees"
        onRowClick={(row) => setSelected(row)}
        toolbarExtra={
          <label className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
            <span className="sr-only">Money flow</span>
            <Select
              value={flow}
              onChange={(e) => {
                onFlow(e.target.value as ProviderFeeFlowKey | "");
                table.setPage(1);
              }}
              className="w-full sm:w-56"
            >
              <option value="">Every flow</option>
              {FLOW_META.filter((m) => m.key !== "REFUND").map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </Select>
          </label>
        }
        emptyIcon={Coins}
        emptyTitle={flow ? `No ${flowMeta(flow).label.toLowerCase()} fees in this window` : "No Paystack fees in this window"}
        emptyDescription="Fees land here as Paystack settles payments and transfers."
        mobileCard={(row) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <FlowTag flow={row.flow} />
              <p className="mt-1 truncate text-xs text-ink-muted">
                {row.owner?.name ?? "Not linked"} · {when(row.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black tabular-nums text-danger">-{naira(row.fee, 2)}</p>
              <p className="text-[11px] tabular-nums text-ink-faint">{row.gross != null ? `of ${nairaCompact(row.gross)}` : ""}</p>
            </div>
          </div>
        )}
      />
      <FeeDrawer row={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function FeeDrawer({ row, onClose }: { row: ProviderFeeRow | null; onClose: () => void }) {
  const m = row ? flowMeta(row.flow) : null;
  return (
    <Drawer
      open={Boolean(row)}
      onClose={onClose}
      width="md"
      title={m ? `${m.label} fee` : "Fee"}
      subtitle={row ? <span className="font-mono">{row.reference}</span> : undefined}
      footer={
        row?.orderId ? (
          <div className="flex justify-end">
            <LinkButton href={`/orders/${row.orderId}`} size="sm" icon={ExternalLink}>
              Open order
            </LinkButton>
          </div>
        ) : undefined
      }
    >
      {row && m ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-ink-muted">Paystack took</p>
                <p className="mt-1 text-2xl font-black tracking-tight tabular-nums text-danger">-{naira(row.fee, 2)}</p>
              </div>
              <FlowTag flow={row.flow} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <DrawerFigure label="Gross" value={row.gross != null ? naira(row.gross, 2) : "Not found"} />
              <DrawerFigure label="Rate" value={row.effectiveRate != null ? ratePercent(row.effectiveRate) : "n/a"} />
              <DrawerFigure label="Net" value={row.gross != null ? naira(row.gross - row.fee, 2) : "n/a"} />
            </div>
          </div>

          {row.owner ? (
            <PersonCard person={row.owner} label={m.direction === "in" ? "Paid in by" : "Paid out to"} />
          ) : (
            <p className="rounded-xl bg-surface px-4 py-4 text-xs text-ink-muted">The payment or transfer for this fee could not be found.</p>
          )}

          <KeyValue
            columns={2}
            items={[
              { label: "When", value: when(row.createdAt) },
              { label: "Direction", value: m.direction === "in" ? "Money in" : "Money out" },
              { label: "Fee row", value: <span className="font-mono text-xs">{row._id}</span> },
              {
                label: "Charged on",
                value: row.sourceTransactionId ? <span className="font-mono text-xs">{row.sourceTransactionId}</span> : "Not found",
              },
              ...(row.orderId
                ? [
                    {
                      label: "Order",
                      value: (
                        <Link href={`/orders/${row.orderId}`} className="text-xs font-bold text-brand-dark hover:underline">
                          View order
                        </Link>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ) : null}
    </Drawer>
  );
}

function DrawerFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-card px-3 py-2.5">
      <p className="text-[11px] font-semibold text-ink-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-black tabular-nums text-ink">{value}</p>
    </div>
  );
}
