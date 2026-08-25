"use client";

import * as React from "react";
import { Calculator, MapPin, Share2, Bike, Fuel } from "lucide-react";
import {
  useDeliveryPriceAnalyticsQuery,
  useDeliveryCalcConfigQuery,
  useUpdateDeliveryCalcConfig,
  type DeliveryPriceAnalytics,
} from "@/api/queries/deliveryPrice";
import { StatCard } from "@/components/StatCard";
import { BarSeriesChart, CHART_COLORS, ChartCard, TrendAreaChart } from "@/components/charts";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const naira = (v: number) => `₦${Math.round(v || 0).toLocaleString()}`;

/** Reshape feedback byBand rows into a per-band fairness table. */
function bandTable(fb: DeliveryPriceAnalytics["feedback"]) {
  const bands = ["0-2", "2-5", "5-8", "8+"];
  const rows = bands.map((band) => {
    const get = (verdict: string) =>
      fb.byBand.find((r) => r._id.band === band && r._id.verdict === verdict)?.count ?? 0;
    const low = get("too_low");
    const fair = get("fair");
    const high = get("too_high");
    const total = low + fair + high;
    const suggested = fb.medianSuggestedByBand.find((s) => s.band === band);
    return { band, low, fair, high, total, medianSuggested: suggested?.median ?? 0 };
  });
  return rows.filter((r) => r.total > 0);
}

/** Reshape feedback bySegment rows into a per-segment fairness table. */
function segmentTable(fb: DeliveryPriceAnalytics["feedback"]) {
  const segments: { key: string; label: string }[] = [
    { key: "rider", label: "Riders" },
    { key: "customer", label: "Senders" },
    { key: "business", label: "Businesses" },
  ];
  return segments
    .map(({ key, label }) => {
      const get = (verdict: string) =>
        fb.bySegment.find((r) => r._id.segment === key && r._id.verdict === verdict)?.count ?? 0;
      const low = get("too_low");
      const fair = get("fair");
      const high = get("too_high");
      const total = low + fair + high;
      return { label, low, fair, high, total };
    })
    .filter((r) => r.total > 0);
}

const DeliveryPricePage = () => {
  const [days, setDays] = React.useState(30);
  const { data, isLoading } = useDeliveryPriceAnalyticsQuery(days);

  const q = data?.quotes;
  const eng = data?.engagement;
  const fb = data?.feedback;
  const fbTotal = fb?.total ?? 0;
  const pct = (n: number) => (fbTotal ? Math.round((n / fbTotal) * 100) : 0);

  const perDay = (q?.perDay ?? []).map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }));
  const bands = q?.distanceBands ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-clash-display text-2xl font-semibold text-foreground">
            Delivery Price Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Public tool usage, demand map & price-fairness feedback.
          </p>
        </div>
        <div className="inline-flex rounded-xl border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                days === r.days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Quotes fetched"
          value={isLoading ? "—" : (q?.total ?? 0).toLocaleString()}
          icon={<Calculator size={18} />}
          tone="brand"
        />
        <StatCard
          label="Avg price"
          value={isLoading ? "—" : naira(q?.avgPrice ?? 0)}
          icon={<Fuel size={18} />}
          footer={`Fuel: ${naira(data?.currentFuelPrice ?? 0)}/L`}
        />
        <StatCard
          label="Shared / Booked"
          value={isLoading ? "—" : `${eng?.shareRate ?? 0}% / ${eng?.bookRate ?? 0}%`}
          icon={<Share2 size={18} />}
          footer={`${eng?.share ?? 0} shares · ${eng?.book ?? 0} books`}
        />
        <StatCard
          label="Batch usage"
          value={isLoading ? "—" : `${q?.batchRate ?? 0}%`}
          icon={<Bike size={18} />}
          footer={`Avg ${q?.avgDistanceKm ?? 0} km`}
        />
      </div>

      {/* Trend + bands */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Quotes per day" subtitle="Are people using it?" className="lg:col-span-2">
          {perDay.length ? (
            <TrendAreaChart
              data={perDay}
              xKey="date"
              series={[{ key: "count", label: "Quotes", color: CHART_COLORS[0] }]}
            />
          ) : (
            <Empty />
          )}
        </ChartCard>

        <ChartCard title="Distance bands" subtitle="How far people send">
          {bands.length ? (
            <BarSeriesChart
              data={bands}
              xKey="band"
              series={[{ key: "count", label: "Quotes", color: CHART_COLORS[1] }]}
            />
          ) : (
            <Empty />
          )}
        </ChartCard>
      </div>

      {/* Demand map: top areas */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Top pickup areas" subtitle="Your Enugu demand map">
          <AreaList rows={q?.topPickups} />
        </ChartCard>
        <ChartCard title="Top delivery areas">
          <AreaList rows={q?.topDropoffs} />
        </ChartCard>
      </div>

      {/* Price fairness */}
      <ChartCard
        title="Is the price fair?"
        subtitle={`${fbTotal} responses · read-only signal, never auto-adjusts pricing`}
      >
        {fbTotal ? (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <Verdict label="Too low" value={pct(fb!.verdicts.too_low)} color="#e0a34a" />
              <Verdict label="Fair" value={pct(fb!.verdicts.fair)} color="#3fa49f" />
              <Verdict label="Too high" value={pct(fb!.verdicts.too_high)} color="#d64545" />
            </div>

            <div className="overflow-x-auto">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">By distance</p>
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">Distance</th>
                    <th className="py-2 text-right">Too low</th>
                    <th className="py-2 text-right">Fair</th>
                    <th className="py-2 text-right">Too high</th>
                    <th className="py-2 text-right">Median suggested</th>
                  </tr>
                </thead>
                <tbody>
                  {bandTable(fb!).map((r) => (
                    <tr key={r.band} className="border-t">
                      <td className="py-2 font-semibold">{r.band} km</td>
                      <td className="py-2 text-right">{Math.round((r.low / r.total) * 100)}%</td>
                      <td className="py-2 text-right">{Math.round((r.fair / r.total) * 100)}%</td>
                      <td className="py-2 text-right">{Math.round((r.high / r.total) * 100)}%</td>
                      <td className="py-2 text-right font-semibold">
                        {r.medianSuggested ? naira(r.medianSuggested) : "n/a"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {segmentTable(fb!).length ? (
              <div className="overflow-x-auto">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">By who is asking</p>
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2">Segment</th>
                      <th className="py-2 text-right">Too low</th>
                      <th className="py-2 text-right">Fair</th>
                      <th className="py-2 text-right">Too high</th>
                      <th className="py-2 text-right">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentTable(fb!).map((r) => (
                      <tr key={r.label} className="border-t">
                        <td className="py-2 font-semibold">{r.label}</td>
                        <td className="py-2 text-right">{Math.round((r.low / r.total) * 100)}%</td>
                        <td className="py-2 text-right">{Math.round((r.fair / r.total) * 100)}%</td>
                        <td className="py-2 text-right">{Math.round((r.high / r.total) * 100)}%</td>
                        <td className="py-2 text-right font-semibold">{r.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <FuelTrend perDay={q?.perDay ?? []} />
          </div>
        ) : (
          <Empty label="No feedback yet." />
        )}
      </ChartCard>

      <SettingsCard />
    </div>
  );
};

function SettingsCard() {
  const { data } = useDeliveryCalcConfigQuery();
  const update = useUpdateDeliveryCalcConfig();
  const [form, setForm] = React.useState<{
    maxExtraStops: number;
    staleDays: number;
    batchDiscountPercent: number;
  } | null>(null);

  React.useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  const f = form ?? { maxExtraStops: 3, staleDays: 7, batchDiscountPercent: 0 };
  const set = (k: keyof typeof f, v: number) => setForm({ ...f, [k]: v });

  return (
    <ChartCard title="Calculator settings" subtitle="Tune the public tool's behaviour">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Max extra stops"
          hint="Beyond the first delivery"
          value={f.maxExtraStops}
          onChange={(v) => set("maxExtraStops", v)}
        />
        <Field
          label="Quote stale after (days)"
          hint="Shows refresh banner"
          value={f.staleDays}
          onChange={(v) => set("staleDays", v)}
        />
        <Field
          label="Batch discount (%)"
          hint="Extra off batch totals"
          value={f.batchDiscountPercent}
          onChange={(v) => set("batchDiscountPercent", v)}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => form && update.mutate(form)}
          disabled={update.isPending || !form}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {update.isPending ? "Saving…" : "Save settings"}
        </button>
        {update.isSuccess ? (
          <span className="text-sm font-semibold text-emerald-600">Saved</span>
        ) : null}
      </div>

      {data?.corePricing ? (
        <div className="mt-5 rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Base pricing (from core delivery config, read-only)
          </p>
          <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
            <ReadOnly label="Rate / km" value={naira(data.corePricing.pricePerKm)} />
            <ReadOnly label="Minimum fare" value={naira(data.corePricing.minimum)} />
            <ReadOnly label="Fuel / litre" value={naira(data.corePricing.fuelPrice)} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Edit these in the core delivery-pricing config so the calculator and live orders stay
            identical.
          </p>
        </div>
      ) : null}
    </ChartCard>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-bold text-foreground">{value}</p>
    </div>
  );
}

function FuelTrend({ perDay }: { perDay: { date: string; fuel: number }[] }) {
  const data = perDay
    .filter((d) => d.fuel > 0)
    .map((d) => ({ date: d.date.slice(5), fuel: d.fuel }));
  if (data.length < 2) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
        Fuel price over time (₦/litre)
      </p>
      <TrendAreaChart
        data={data}
        xKey="date"
        type="line"
        currency
        height={180}
        series={[{ key: "fuel", label: "Fuel ₦/L", color: "#e0a34a" }]}
      />
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="space-y-1 text-sm font-medium text-foreground">
      {label}
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-h-10 w-full rounded-lg border bg-background px-3"
      />
      <span className="block text-xs font-normal text-muted-foreground">{hint}</span>
    </label>
  );
}

function AreaList({ rows }: { rows?: { area: string; count: number }[] }) {
  if (!rows?.length) return <Empty />;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.area} className="flex items-center gap-3 text-sm">
          <MapPin size={13} className="shrink-0 text-muted-foreground" />
          <span className="w-32 shrink-0 truncate font-medium">{r.area}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </span>
          <span className="w-8 shrink-0 text-right font-semibold">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

function Verdict({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border p-3 text-center">
      <p className="text-2xl font-bold" style={{ color }}>
        {value}%
      </p>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

function Empty({ label = "No data in this period yet." }: { label?: string }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export default DeliveryPricePage;
