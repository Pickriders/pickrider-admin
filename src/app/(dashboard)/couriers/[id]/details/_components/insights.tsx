"use client";

import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  Gavel,
  MapPin,
  MapPinned,
  Medal,
  Route,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { isAxiosError } from "axios";
import { useMemo, useState } from "react";

import {
  Badge,
  BarsChart,
  ChartCard,
  DonutChart,
  EmptyState,
  ErrorState,
  Heatmap,
  Panel,
  PanelHeader,
  Skeleton,
  StatCard,
  StatGrid,
  TrendChart,
  cx,
} from "@/components/kit";
import { bucketLabel } from "@/components/users/user-panels";
import type { RangeQuery, RiderInsightsOverview, RiderInsightsProfile } from "@/lib/admin/api";
import { count, naira, percent, trend, when } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/http";
import {
  useRiderAchievements,
  useRiderDeliveryMap,
  useRiderEarnings,
  useRiderInsightsOverview,
  useRiderInsightsProfile,
  useRiderRank,
} from "@/lib/admin/hooks";

import { DeliveryMap } from "./delivery-map";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_MS = 86_400_000;

const hourLabel = (hour: number) => `${hour % 12 || 12}${hour >= 12 ? "pm" : "am"}`;
const mins = (value?: number) => (value ? `${Math.round(value)} min` : "–");

/** Days a range covers, to pick a sensible chart bucket (all time → months). */
function spanDays(range: RangeQuery) {
  if (range.all || !range.from) return 999;
  const to = range.to ? new Date(range.to) : new Date();
  return Math.max(1, Math.round((to.getTime() - new Date(range.from).getTime()) / DAY_MS) + 1);
}

type Flag = { tone: "danger" | "warning"; title: string; detail: string };

/**
 * Judgement calls staff would otherwise make by reading every number: only the things worth a look,
 * each with the figure behind it. Thresholds need a minimum sample so one bad day isn't a flag.
 */
function flagsFor(overview?: RiderInsightsOverview, profile?: RiderInsightsProfile): Flag[] {
  if (!overview || !profile) return [];
  const flags: Flag[] = [];
  const p = overview.performance;
  const { rating, bids } = p;
  if (rating.count >= 5 && rating.average < 4) {
    flags.push({
      tone: rating.average < 3.5 ? "danger" : "warning",
      title: `Rating ${rating.average.toFixed(1)}`,
      detail: `Below 4.0 across ${count(rating.count)} reviews.`,
    });
  }
  if (p.orders >= 5 && p.completionRate < 85) {
    flags.push({
      tone: p.completionRate < 70 ? "danger" : "warning",
      title: `Completes ${percent(p.completionRate)} of orders`,
      detail: `${count(p.cancelled)} of ${count(p.orders)} assigned orders were cancelled.`,
    });
  }
  const riderCancels = profile.cancellations.byRider;
  if (riderCancels >= 3) {
    const top = profile.cancellations.riderReasons[0];
    flags.push({
      tone: riderCancels >= 6 ? "danger" : "warning",
      title: `Cancelled ${count(riderCancels)} orders themselves`,
      detail: top ? `Most often: “${top.reason}”.` : "No reason given.",
    });
  }
  const lc = profile.locationChanges;
  const missed = lc.declined + lc.expired;
  if (lc.total >= 3 && missed / lc.total > 0.5) {
    flags.push({
      tone: "warning",
      title: "Rarely takes location changes",
      detail: `Declined or ignored ${count(missed)} of ${count(lc.total)} customer requests.`,
    });
  }
  if (bids.total >= 10 && bids.winRate < 20) {
    flags.push({
      tone: "warning",
      title: `Wins ${percent(bids.winRate)} of bids`,
      detail: `${count(bids.won)} of ${count(bids.total)} offers accepted. Their prices may be too high.`,
    });
  }
  const last = profile.lifetime.lastDeliveryAt ? new Date(profile.lifetime.lastDeliveryAt) : null;
  if (profile.lifetime.completed > 0 && last && Date.now() - last.getTime() > 14 * DAY_MS) {
    flags.push({ tone: "warning", title: "Gone quiet", detail: `No delivery since ${when(last)}.` });
  }
  if (profile.withdrawals.failed > 0) {
    flags.push({
      tone: "danger",
      title: `${count(profile.withdrawals.failed)} failed withdrawal${profile.withdrawals.failed === 1 ? "" : "s"}`,
      detail: "Check the settlement account and wallet history.",
    });
  }
  return flags;
}

function FlagsPanel({ flags, loading }: { flags: Flag[]; loading: boolean }) {
  if (loading) return <Skeleton className="h-20 w-full" />;
  if (!flags.length) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success-soft px-4 py-3">
        <CheckCircle2 size={18} className="shrink-0 text-success" />
        <p className="text-sm">
          <span className="font-bold text-ink">Nothing needs attention.</span>{" "}
          <span className="text-ink-muted">
            Rating, completion, cancellations and payouts all look healthy in this window.
          </span>
        </p>
      </div>
    );
  }
  return (
    <Panel>
      <PanelHeader
        title="Worth a look"
        subtitle={`${flags.length} thing${flags.length === 1 ? "" : "s"} stand out in this window`}
      />
      <ul className="grid grid-cols-1 gap-2 px-5 pb-5 pt-4 md:grid-cols-2 xl:grid-cols-3">
        {flags.map((flag) => (
          <li
            key={flag.title}
            className={cx(
              "flex items-start gap-3 rounded-xl px-4 py-3",
              flag.tone === "danger" ? "bg-danger-soft" : "bg-warning-soft",
            )}
          >
            <AlertTriangle
              size={16}
              className={cx("mt-0.5 shrink-0", flag.tone === "danger" ? "text-danger" : "text-warning")}
            />
            <div className="min-w-0 text-sm">
              <p className="font-bold text-ink">{flag.title}</p>
              <p className="text-ink-muted">{flag.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function WorkingPattern({
  profile,
  overview,
  loading,
}: {
  profile?: RiderInsightsProfile;
  overview?: RiderInsightsOverview;
  loading: boolean;
}) {
  const cells = useMemo(() => profile?.workingHours ?? [], [profile]);
  const busiest = useMemo(() => {
    if (!cells.length) return null;
    const best = cells.reduce((a, b) => (b.count > a.count ? b : a));
    const byDay = DAYS.map((label, day) => ({
      label,
      total: cells.filter((c) => c.day === day).reduce((s, c) => s + c.count, 0),
    }));
    const bestDay = byDay.reduce((a, b) => (b.total > a.total ? b : a));
    return { hour: `${DAYS[best.day]}s around ${hourLabel(best.hour)}`, day: bestDay.label };
  }, [cells]);
  const activity = overview?.activity;
  const life = profile?.lifetime;

  return (
    <Panel>
      <PanelHeader
        title="When they work"
        subtitle={busiest ? `Busiest: ${busiest.hour}` : "Completed deliveries by weekday and hour, Lagos time"}
      />
      <div className="grid grid-cols-1 gap-4 p-5 pt-4 lg:grid-cols-[1fr_220px]">
        {loading ? (
          <Skeleton className="h-44 w-full" />
        ) : (
          <Heatmap
            cells={cells}
            maxHint={
              cells.length
                ? "Darker means more deliveries completed in that block."
                : "No completed deliveries in this window."
            }
          />
        )}
        <div className="space-y-3">
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">This week</p>
            <div className="mt-2 flex gap-1.5">
              {WEEK.map((label, i) => {
                const on = activity?.activeDays?.[i];
                return (
                  <span
                    key={i}
                    title={on ? "Delivered" : "No delivery"}
                    className={cx(
                      "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold",
                      on ? "bg-brand text-white" : "bg-card text-ink-faint",
                    )}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
            <Flame size={18} className="shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-bold text-ink">{count(activity?.streakDays)} day streak</p>
              <p className="text-xs text-ink-muted">{count(life?.activeDays)} active days ever</p>
            </div>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3 text-xs text-ink-muted">
            <p>
              First delivery:{" "}
              <span className="font-semibold text-ink">{life?.firstDeliveryAt ? when(life.firstDeliveryAt) : "–"}</span>
            </p>
            <p className="mt-1">
              Latest:{" "}
              <span className="font-semibold text-ink">{life?.lastDeliveryAt ? when(life.lastDeliveryAt) : "–"}</span>
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Meter({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  const width = total ? Math.round((value / total) * 100) : 0;
  return (
    <li>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ink-muted">{label}</span>
        <span className="tabular-nums text-ink">
          {count(value)} <span className="text-ink-faint">· {width}%</span>
        </span>
      </div>
      <span className="mt-1 block h-2 overflow-hidden rounded-full bg-surface">
        <span className={cx("block h-full rounded-full", tone)} style={{ width: `${width}%` }} />
      </span>
    </li>
  );
}

function Reliability({ profile, loading }: { profile?: RiderInsightsProfile; loading: boolean }) {
  const c = profile?.cancellations;
  const lc = profile?.locationChanges;
  const w = profile?.withdrawals;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Panel>
        <PanelHeader
          title="Cancelled orders"
          subtitle={c ? `${count(c.total)} in this window, by who cancelled` : "Who cancelled, and why"}
        />
        <div className="px-5 pb-5 pt-4">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : !c?.total ? (
            <EmptyState
              compact
              icon={CheckCircle2}
              title="No cancellations"
              description="Every order assigned in this window went ahead."
            />
          ) : (
            <>
              <ul className="space-y-3">
                <Meter label="By the rider" value={c.byRider} total={c.total} tone="bg-danger" />
                <Meter label="By the customer" value={c.byCustomer} total={c.total} tone="bg-warning" />
                <Meter label="By staff" value={c.byAdmin} total={c.total} tone="bg-info" />
              </ul>
              {c.riderReasons.length ? (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Rider’s reasons</p>
                  <ul className="mt-2 space-y-1.5">
                    {c.riderReasons.map((r) => (
                      <li key={r.reason} className="flex items-start justify-between gap-3 text-sm">
                        <span className="min-w-0 text-ink">“{r.reason}”</span>
                        <Badge>{count(r.count)}×</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Location changes" subtitle="How they answer customers moving a stop" />
        <div className="px-5 pb-5 pt-4">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : !lc?.total ? (
            <EmptyState
              compact
              icon={MapPin}
              title="No requests"
              description="No customer asked to change a stop on their orders."
            />
          ) : (
            <ul className="space-y-3">
              <Meter label="Accepted" value={lc.accepted} total={lc.total} tone="bg-success" />
              <Meter label="Declined" value={lc.declined} total={lc.total} tone="bg-danger" />
              <Meter label="Ran out of time" value={lc.expired} total={lc.total} tone="bg-warning" />
              <Meter label="Withdrawn by customer" value={lc.cancelled} total={lc.total} tone="bg-line-strong" />
            </ul>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Withdrawals" subtitle="Cash-outs to their bank in this window" />
        <div className="px-5 pb-5 pt-4">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : !w?.count ? (
            <EmptyState
              compact
              icon={Banknote}
              title="No withdrawals"
              description="They haven’t cashed out in this window."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Paid out</p>
                <p className="mt-0.5 text-lg font-black text-ink">{naira(w.total)}</p>
              </div>
              <div className="rounded-xl bg-surface px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Requests</p>
                <p className="mt-0.5 text-lg font-black text-ink">{count(w.count)}</p>
              </div>
              <div className="rounded-xl bg-surface px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Processing</p>
                <p className="mt-0.5 text-lg font-black text-ink">{naira(w.processing)}</p>
              </div>
              <div className={cx("rounded-xl px-4 py-3", w.failed ? "bg-danger-soft" : "bg-surface")}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Failed</p>
                <p className={cx("mt-0.5 text-lg font-black", w.failed ? "text-danger" : "text-ink")}>
                  {count(w.failed)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function Standing({
  riderId,
  range,
  overview,
}: {
  riderId: string;
  range: RangeQuery;
  overview?: RiderInsightsOverview;
}) {
  const [scope, setScope] = useState<"state" | "country">("state");
  const rank = useRiderRank(riderId, range, scope);
  const achievements = useRiderAchievements(riderId);
  const me = rank.data?.me;
  const goal = overview?.goal;
  const list = achievements.data?.results ?? [];
  const unlocked = list.filter((a) => a.unlockedAt);
  const next = list.filter((a) => !a.unlockedAt).sort((a, b) => b.progress / b.target - a.progress / a.target)[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Panel>
        <PanelHeader
          title="Rank"
          subtitle="By completed deliveries in this window"
          action={
            <div className="flex rounded-lg bg-surface p-0.5 text-xs font-semibold">
              {(["state", "country"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={cx(
                    "rounded-md px-2.5 py-1 capitalize",
                    scope === s ? "bg-card text-ink shadow-sm" : "text-ink-muted",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          }
        />
        <div className="px-5 pb-5 pt-4">
          {rank.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !me?.rank ? (
            <EmptyState
              compact
              icon={Medal}
              title="Not ranked yet"
              description="They need a completed delivery in this window to be ranked."
            />
          ) : (
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-soft text-2xl font-black text-brand-dark">
                #{me.rank}
              </span>
              <div className="text-sm">
                <p className="font-bold text-ink">
                  Top {Math.max(1, Math.round((me.rank / Math.max(me.totalRanked, 1)) * 100))}% in their {scope}
                </p>
                <p className="text-ink-muted">
                  {count(me.deliveries)} deliveries · {count(me.totalRanked)} riders ranked
                </p>
              </div>
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Weekly goal" subtitle="The take-home target they set in the app" />
        <div className="px-5 pb-5 pt-4">
          {!goal?.weeklyTarget ? (
            <EmptyState
              compact
              icon={Target}
              title="No goal set"
              description="Riders can set a weekly earnings goal in their insights."
            />
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-black text-ink">{naira(goal.weekNet)}</p>
                <p className="text-xs text-ink-muted">of {naira(goal.weeklyTarget)}</p>
              </div>
              <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-surface">
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${Math.min(goal.progressPct, 100)}%` }}
                />
              </span>
              <p className="mt-2 text-xs text-ink-muted">
                {Math.round(goal.progressPct)}% of the way there since Monday
              </p>
            </>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Achievements"
          subtitle={
            achievements.data
              ? `${count(unlocked.length)} of ${count(list.length)} unlocked`
              : "Milestones from the rider app"
          }
        />
        <div className="px-5 pb-5 pt-4">
          {achievements.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !list.length ? (
            <EmptyState
              compact
              icon={Trophy}
              title="No milestones"
              description="Achievements show up once the rider starts delivering."
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {unlocked.slice(0, 10).map((a) => (
                  <span key={a.key} title={`${a.title}: ${a.description}`}>
                    <Badge tone="brand">
                      <Trophy size={11} /> {a.title}
                    </Badge>
                  </span>
                ))}
                {!unlocked.length ? <p className="text-xs text-ink-faint">None unlocked yet.</p> : null}
              </div>
              {next ? (
                <div className="mt-3 rounded-xl bg-surface px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Closest next</p>
                  <p className="mt-0.5 text-sm font-bold text-ink">{next.title}</p>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-card">
                    <span
                      className="block h-full rounded-full bg-brand"
                      style={{ width: `${Math.round((next.progress / next.target) * 100)}%` }}
                    />
                  </span>
                  <p className="mt-1 text-xs text-ink-muted">
                    {count(next.progress)} / {count(next.target)} · {next.description}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}

/**
 * The rider's own insights, as staff see them — and more: red flags up top, how they perform and
 * earn, when and where they work, how reliable they are (cancellations, location changes, payouts),
 * and where they stand. Everything follows the page's date range.
 */
export function RiderInsights({
  riderId,
  range,
  windowLabel,
}: {
  riderId: string;
  range: RangeQuery;
  windowLabel: string;
}) {
  const days = spanDays(range);
  const bucket = days <= 31 ? "day" : days <= 180 ? "week" : "month";
  const overview = useRiderInsightsOverview(riderId, range);
  const earnings = useRiderEarnings(riderId, range, bucket);
  const profile = useRiderInsightsProfile(riderId, range);
  const map = useRiderDeliveryMap(riderId, range);

  const o = overview.data;
  const p = o?.performance;
  const e = o?.earnings;
  const loading = overview.isLoading && !o;
  const flags = useMemo(() => flagsFor(o, profile.data), [o, profile.data]);
  const byType = earnings.data?.byType;
  const typeData = byType
    ? [
        { name: "Single", value: byType.single },
        { name: "Batch", value: byType.batch },
        { name: "Bulk", value: byType.bulk },
      ].filter((d) => d.value > 0)
    : [];
  const points = map.data?.points ?? [];
  // A failed load must never pass for "no activity": say what went wrong. A 404 means the API this
  // admin talks to doesn't have the insights routes yet (the backend isn't deployed there).
  const failure = [overview, profile, earnings, map].find((q) => q.error && !q.data)?.error;
  if (failure && !o) {
    const notDeployed = isAxiosError(failure) && failure.response?.status === 404;
    return (
      <ErrorState
        message={
          notDeployed
            ? "Rider insights aren't available on this server yet. Deploy the latest backend, then try again."
            : errorMessage(failure, "Could not load this rider's insights.")
        }
        onRetry={() => [overview, profile, earnings, map].forEach((q) => q.refetch())}
      />
    );
  }
  const pickups = points.filter((pt) => pt.type === "PICKUP").length;

  return (
    <div className="space-y-4">
      <FlagsPanel flags={flags} loading={loading || (profile.isLoading && !profile.data)} />

      <StatGrid columns={6}>
        <StatCard
          label="Take-home"
          value={naira(e?.net)}
          icon={Banknote}
          tone="brand"
          loading={loading}
          trend={e ? trend(e.net, e.previousNet) : undefined}
          hint={e ? `${naira(e.charges)} commission on ${naira(e.gross)}` : undefined}
        />
        <StatCard
          label="Completion rate"
          value={percent(p?.completionRate)}
          icon={Gauge}
          loading={loading}
          hint={p ? `${count(p.completed)} of ${count(p.orders)} assigned` : undefined}
        />
        <StatCard
          label="Bid win rate"
          value={percent(p?.bids.winRate)}
          icon={Gavel}
          loading={loading}
          hint={p ? `${count(p.bids.won)} of ${count(p.bids.total)} offers accepted` : undefined}
        />
        <StatCard
          label="Avg to pickup"
          value={mins(p?.avgPickupMins)}
          icon={Timer}
          loading={loading}
          hint="From setting off to arriving"
        />
        <StatCard
          label="Avg delivery"
          value={mins(p?.avgDeliveryMins)}
          icon={Clock}
          loading={loading}
          hint="From start to last drop-off"
        />
        <StatCard
          label="Distance covered"
          value={p ? `${count(Math.round(p.distanceKm))} km` : "–"}
          icon={Route}
          loading={loading}
          hint={e?.deliveries ? `${naira(e.avgPerDelivery)} take-home per delivery` : undefined}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="Take-home vs gross"
            subtitle={`Per ${bucket}, ${windowLabel}. The gap is Pickriders' commission.`}
            loading={earnings.isLoading && !earnings.data}
            empty={!earnings.data?.points.some((pt) => pt.gross > 0)}
            height={260}
          >
            <TrendChart
              data={(earnings.data?.points ?? []) as unknown as Record<string, unknown>[]}
              xKey="bucket"
              xFormat={bucketLabel(bucket)}
              yFormat="naira"
              kind="area"
              series={[
                { key: "gross", label: "Gross", format: "naira" },
                { key: "net", label: "Take-home", format: "naira" },
              ]}
            />
          </ChartCard>
        </div>
        <ChartCard
          title="Earnings by order type"
          subtitle="Gross rider fees in this window"
          loading={earnings.isLoading && !earnings.data}
          empty={!typeData.length}
          height={260}
        >
          <DonutChart data={typeData} format="naira" centerLabel="Gross" centerValue={naira(e?.gross)} />
        </ChartCard>
      </div>

      <WorkingPattern profile={profile.data} overview={o} loading={profile.isLoading && !profile.data} />

      <Panel>
        <PanelHeader
          title="Where they deliver"
          subtitle={
            points.length
              ? `${count(pickups)} pickups and ${count(points.length - pickups)} drop-offs completed, ${windowLabel}`
              : "Completed stops in this window"
          }
          action={
            <div className="flex items-center gap-3 text-[11px] font-semibold text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Pickup
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#f08a24" }} /> Drop-off
              </span>
            </div>
          }
        />
        <div className="h-[340px] p-5 pt-4">
          {map.isLoading && !map.data ? (
            <Skeleton className="h-full w-full" />
          ) : !points.length ? (
            <EmptyState
              compact
              icon={MapPinned}
              title="No completed stops"
              description="Stops appear here as the rider completes deliveries."
            />
          ) : (
            <DeliveryMap points={points} />
          )}
        </div>
      </Panel>

      <Reliability profile={profile.data} loading={profile.isLoading && !profile.data} />

      {p && p.bids.total > 0 ? (
        <ChartCard title="Offers" subtitle="Bids they sent and how many customers accepted" height={180}>
          <BarsChart
            horizontal
            data={[{ label: "Offers", won: p.bids.won, lost: p.bids.total - p.bids.won }]}
            xKey="label"
            stacked
            series={[
              { key: "won", label: "Accepted" },
              { key: "lost", label: "Not accepted" },
            ]}
          />
        </ChartCard>
      ) : null}

      <Standing riderId={riderId} range={range} overview={o} />
    </div>
  );
}
