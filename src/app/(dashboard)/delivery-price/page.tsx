"use client";

import { Bike, Calculator, Fuel, MapPin, Share2 } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";

import { BarsChart, Button, ChartCard, EmptyState, Field, Input, KeyValue, PageHeader, Panel, PanelHeader, RangeTabs, Skeleton, StatCard, StatGrid, TrendChart, presetRange, rangeToQuery, type RangeValue } from "@/components/kit";
import { deliveryPrice } from "@/lib/admin/api";
import { count, percent } from "@/lib/admin/format";
import { useAction, useDeliveryPriceAnalytics, useDeliveryPriceConfig } from "@/lib/admin/hooks";

/**
 * The public delivery price calculator on the website: how much it is used,
 * where people send from and to, whether they think the price is fair, and
 * the three knobs that tune it. Unlike the rest of the platform, this API
 * already returns naira (it converts on the server), so nothing here divides.
 */
type Analytics = {
  range: { from: string; to: string };
  currentFuelPrice: number;
  quotes: {
    total: number;
    batchRate: number;
    avgDistanceKm: number;
    avgPrice: number;
    perDay: { date: string; count: number; fuel: number }[];
    distanceBands: { band: string; count: number }[];
    topPickups: { area: string; count: number }[];
    topDropoffs: { area: string; count: number }[];
  };
  engagement: { share: number; copy: number; book: number; shareRate: number; bookRate: number };
  feedback: {
    total: number;
    verdicts: { too_low: number; fair: number; too_high: number };
    bySegment: { _id: { segment: string; verdict: string }; count: number }[];
    byBand: { _id: { band: string; verdict: string }; count: number }[];
    medianSuggestedByBand: { band: string; median: number; count: number }[];
  };
};

type CalcConfig = {
  maxExtraStops: number;
  staleDays: number;
  batchDiscountPercent: number;
  corePricing?: { pricePerKm: number; minimum: number; fuelPrice: number };
};

const nairaWhole = (value: number | null | undefined) => `₦${Math.round(value || 0).toLocaleString("en-NG")}`;

const BANDS = ["0-2", "2-5", "5-8", "8+"];
const SEGMENTS = [
  { key: "rider", label: "Riders" },
  { key: "customer", label: "Senders" },
  { key: "business", label: "Businesses" },
];

function share(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

export default function DeliveryPricePage() {
  return (
    <Suspense>
      <DeliveryPriceView />
    </Suspense>
  );
}

function DeliveryPriceView() {
  const [range, setRange] = useState<RangeValue>(() => presetRange(30));
  // The analytics route only takes from/to, so "All" falls back to a wide span.
  const query = useMemo(() => {
    const q = rangeToQuery(range);
    if ("all" in q) return { from: "2024-01-01", to: new Date().toISOString().slice(0, 10) };
    return { from: q.from, to: q.to };
  }, [range]);
  const analytics = useDeliveryPriceAnalytics(query);
  const data = analytics.data as Analytics | undefined;
  const loading = analytics.isLoading && !data;

  const quotes = data?.quotes;
  const engagement = data?.engagement;
  const feedback = data?.feedback;
  const feedbackTotal = feedback?.total ?? 0;

  const perDay = useMemo(() => (quotes?.perDay ?? []).map((d) => ({ date: d.date, count: d.count, fuel: d.fuel })), [quotes?.perDay]);
  const fuelTrend = useMemo(() => perDay.filter((d) => d.fuel > 0), [perDay]);
  const xf = (value: string) => new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });

  const bandRows = useMemo(() => {
    if (!feedback) return [];
    return BANDS.map((band) => {
      const get = (verdict: string) => feedback.byBand.find((r) => r._id.band === band && r._id.verdict === verdict)?.count ?? 0;
      const low = get("too_low");
      const fair = get("fair");
      const high = get("too_high");
      const total = low + fair + high;
      const median = feedback.medianSuggestedByBand.find((s) => s.band === band)?.median ?? 0;
      return { band, low, fair, high, total, median };
    }).filter((r) => r.total > 0);
  }, [feedback]);

  const segmentRows = useMemo(() => {
    if (!feedback) return [];
    return SEGMENTS.map(({ key, label }) => {
      const get = (verdict: string) => feedback.bySegment.find((r) => r._id.segment === key && r._id.verdict === verdict)?.count ?? 0;
      const low = get("too_low");
      const fair = get("fair");
      const high = get("too_high");
      return { label, low, fair, high, total: low + fair + high };
    }).filter((r) => r.total > 0);
  }, [feedback]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Delivery price calculator"
        description="Usage of the public tool on the website, the demand map it reveals, and what people think of the prices."
        actions={<RangeTabs value={range} onChange={setRange} />}
      />

      <StatGrid columns={4}>
        <StatCard tone="brand" label="Quotes fetched" value={count(quotes?.total)} hint={`Average ${quotes?.avgDistanceKm ?? 0} km per quote`} icon={Calculator} loading={loading} />
        <StatCard label="Average price" value={nairaWhole(quotes?.avgPrice)} hint={`Fuel now ${nairaWhole(data?.currentFuelPrice)} per litre`} icon={Fuel} loading={loading} />
        <StatCard label="Shared / booked" value={`${engagement?.shareRate ?? 0}% / ${engagement?.bookRate ?? 0}%`} hint={`${count(engagement?.share)} shares, ${count(engagement?.copy)} copies, ${count(engagement?.book)} bookings`} icon={Share2} loading={loading} />
        <StatCard label="Batch usage" value={percent(quotes?.batchRate, 0)} hint="Quotes with more than one drop-off" icon={Bike} loading={loading} />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Quotes per day" subtitle="Are people using it?" height={260} loading={loading} empty={!perDay.some((d) => d.count)}>
            <TrendChart data={perDay} xKey="date" xFormat={xf} kind="area" series={[{ key: "count", label: "Quotes", format: "count" }]} />
          </ChartCard>
        </div>
        <ChartCard title="Distance bands" subtitle="How far people send" height={260} loading={loading} empty={!quotes?.distanceBands?.length}>
          <BarsChart data={(quotes?.distanceBands ?? []).map((b) => ({ band: `${b.band} km`, count: b.count }))} xKey="band" series={[{ key: "count", label: "Quotes", format: "count", color: "hsl(var(--chart-2))" }]} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AreaPanel title="Top pickup areas" subtitle="Where demand starts" rows={quotes?.topPickups} loading={loading} />
        <AreaPanel title="Top delivery areas" subtitle="Where parcels go" rows={quotes?.topDropoffs} loading={loading} />
      </div>

      <Panel>
        <PanelHeader title="Is the price fair?" subtitle={`${count(feedbackTotal)} responses. A read-only signal, it never changes pricing on its own.`} />
        <div className="p-5 pt-3">
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : !feedbackTotal || !feedback ? (
            <EmptyState compact title="No feedback yet" description="Verdicts appear here once people rate a quote on the website." />
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <Verdict label="Too low" value={share(feedback.verdicts.too_low, feedbackTotal)} tone="text-warning" />
                <Verdict label="Fair" value={share(feedback.verdicts.fair, feedbackTotal)} tone="text-brand" />
                <Verdict label="Too high" value={share(feedback.verdicts.too_high, feedbackTotal)} tone="text-danger" />
              </div>

              <FairnessTable
                caption="By distance"
                head={["Distance", "Too low", "Fair", "Too high", "Median suggested"]}
                rows={bandRows.map((r) => [`${r.band} km`, `${share(r.low, r.total)}%`, `${share(r.fair, r.total)}%`, `${share(r.high, r.total)}%`, r.median ? nairaWhole(r.median) : "n/a"])}
              />
              {segmentRows.length ? (
                <FairnessTable
                  caption="By who is asking"
                  head={["Segment", "Too low", "Fair", "Too high", "Votes"]}
                  rows={segmentRows.map((r) => [r.label, `${share(r.low, r.total)}%`, `${share(r.fair, r.total)}%`, `${share(r.high, r.total)}%`, count(r.total)])}
                />
              ) : null}

              {fuelTrend.length > 1 ? (
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Fuel price over time (naira per litre)</p>
                  <div className="h-44">
                    <TrendChart data={fuelTrend} xKey="date" xFormat={xf} kind="line" series={[{ key: "fuel", label: "Fuel", format: "count", color: "hsl(var(--chart-3))" }]} />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Panel>

      <SettingsPanel />
    </div>
  );
}

function AreaPanel({ title, subtitle, rows, loading }: { title: string; subtitle: string; rows?: { area: string; count: number }[]; loading: boolean }) {
  const max = Math.max(1, ...(rows ?? []).map((r) => r.count));
  return (
    <Panel>
      <PanelHeader title={title} subtitle={subtitle} />
      <div className="p-5 pt-3">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : !rows?.length ? (
          <EmptyState compact title="Nothing in this window" description="Areas show up once quotes are fetched." />
        ) : (
          <div className="space-y-2.5">
            {rows.map((r) => (
              <div key={r.area} className="flex items-center gap-3 text-sm">
                <MapPin size={13} className="shrink-0 text-ink-faint" />
                <span className="w-32 shrink-0 truncate font-medium text-ink">{r.area}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${(r.count / max) * 100}%` }} />
                </span>
                <span className="w-8 shrink-0 text-right font-semibold text-ink">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

function Verdict({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3 text-center">
      <p className={`text-2xl font-black tracking-tight ${tone}`}>{value}%</p>
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
    </div>
  );
}

function FairnessTable({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  return (
    <div className="admin-scroll overflow-x-auto">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint">{caption}</p>
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} className={`border-b border-line py-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint ${i ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-line last:border-0">
              {row.map((cell, i) => (
                <td key={i} className={`py-2 text-ink ${i ? "text-right" : "font-semibold"} ${i === row.length - 1 ? "font-semibold" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsPanel() {
  const config = useDeliveryPriceConfig();
  const data = config.data as CalcConfig | undefined;
  const [form, setForm] = useState<{ maxExtraStops: string; staleDays: string; batchDiscountPercent: string } | null>(null);

  useEffect(() => {
    if (data && !form) {
      setForm({ maxExtraStops: String(data.maxExtraStops ?? 3), staleDays: String(data.staleDays ?? 7), batchDiscountPercent: String(data.batchDiscountPercent ?? 0) });
    }
  }, [data, form]);

  const save = useAction((body: Record<string, number>) => deliveryPrice.updateConfig(body), {
    success: "Calculator settings saved",
    invalidate: [["delivery-price"]],
  });

  const dirty =
    !!form && !!data && (Number(form.maxExtraStops) !== data.maxExtraStops || Number(form.staleDays) !== data.staleDays || Number(form.batchDiscountPercent) !== data.batchDiscountPercent);

  return (
    <Panel>
      <PanelHeader
        title="Calculator settings"
        subtitle="Tune how the public tool behaves. Base pricing itself lives in the core delivery pricing config so quotes and live orders always match."
        action={
          <Button
            size="sm"
            disabled={!dirty}
            loading={save.isPending}
            onClick={() =>
              form &&
              save.mutate({
                maxExtraStops: Number(form.maxExtraStops),
                staleDays: Number(form.staleDays),
                batchDiscountPercent: Number(form.batchDiscountPercent),
              })
            }
          >
            Save settings
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 p-5 pt-3 sm:grid-cols-3">
        {!form ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : (
          <>
            <Field label="Max extra stops" hint="Drop-offs allowed beyond the first (0 to 10)">
              <Input type="number" min={0} max={10} value={form.maxExtraStops} onChange={(e) => setForm({ ...form, maxExtraStops: e.target.value })} />
            </Field>
            <Field label="Quote stale after (days)" hint="Older shared quotes show a refresh banner">
              <Input type="number" min={1} value={form.staleDays} onChange={(e) => setForm({ ...form, staleDays: e.target.value })} />
            </Field>
            <Field label="Batch discount (%)" hint="Extra taken off multi-stop totals">
              <Input type="number" min={0} max={100} value={form.batchDiscountPercent} onChange={(e) => setForm({ ...form, batchDiscountPercent: e.target.value })} />
            </Field>
          </>
        )}
      </div>
      {data?.corePricing ? (
        <div className="mx-5 mb-5 rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Base pricing from the core config (read only)</p>
          <KeyValue
            columns={3}
            items={[
              { label: "Rate per km (fuel adjusted)", value: nairaWhole(data.corePricing.pricePerKm) },
              { label: "Minimum fare", value: nairaWhole(data.corePricing.minimum) },
              { label: "Fuel per litre", value: nairaWhole(data.corePricing.fuelPrice) },
            ]}
          />
        </div>
      ) : null}
    </Panel>
  );
}
