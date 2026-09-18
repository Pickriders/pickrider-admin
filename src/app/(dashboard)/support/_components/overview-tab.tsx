"use client";

import { AlertTriangle, CheckCircle2, Clock, Inbox, Timer, UserX } from "lucide-react";
import { useRouter } from "next/navigation";

import { BarsChart, ChartCard, DonutChart, StatCard, StatGrid } from "@/components/kit";
import { useIssuesSummary } from "@/lib/admin/hooks";

import { CATEGORY_LABEL, PRIORITY_LABEL } from "./shared";

/** Queue health at a glance; every tile jumps to the matching view of the queue. */
export function OverviewTab() {
  const router = useRouter();
  const { data, isPending } = useIssuesSummary();
  const hours = (value: number | null | undefined) =>
    value == null ? "—" : value < 1 ? `${Math.round(value * 60)}m` : `${value}h`;

  return (
    <div className="space-y-5">
      <StatGrid columns={6}>
        <StatCard
          label="Needs attention"
          value={(data?.open ?? 0) + (data?.inReview ?? 0)}
          hint={`${data?.open ?? 0} open · ${data?.inReview ?? 0} in review`}
          icon={Inbox}
          tone="brand"
          loading={isPending}
          onClick={() => router.push("/support")}
        />
        <StatCard
          label="Unassigned"
          value={data?.unassigned ?? 0}
          hint="Nobody has picked these up"
          icon={UserX}
          loading={isPending}
          onClick={() => router.push("/support?view=unassigned")}
        />
        <StatCard
          label="Overdue"
          value={data?.overdue ?? 0}
          hint="Open for more than 48h"
          icon={AlertTriangle}
          loading={isPending}
          onClick={() => router.push("/support?view=overdue")}
        />
        <StatCard
          label="Resolved · 7d"
          value={data?.resolved7d ?? 0}
          hint={`${data?.new7d ?? 0} new in the same week`}
          icon={CheckCircle2}
          loading={isPending}
          onClick={() => router.push("/support?view=resolved")}
        />
        <StatCard
          label="First response"
          value={hours(data?.avgFirstResponseHours)}
          hint="Average, last 30 days"
          icon={Timer}
          loading={isPending}
        />
        <StatCard
          label="Time to resolve"
          value={hours(data?.avgResolutionHours)}
          hint="Average, last 30 days"
          icon={Clock}
          loading={isPending}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Open reports by category"
            subtitle="What customers are struggling with right now"
            loading={isPending}
            empty={!data?.byCategory.length}
          >
            <BarsChart
              data={(data?.byCategory ?? []).map((row) => ({
                category: CATEGORY_LABEL[row.key as keyof typeof CATEGORY_LABEL] ?? row.key,
                count: row.count,
              }))}
              xKey="category"
              series={[{ key: "count", label: "Open reports", format: "count" }]}
              yFormat="count"
              horizontal
            />
          </ChartCard>
        </div>
        <ChartCard title="Open reports by priority" loading={isPending} empty={!data?.byPriority.length}>
          <DonutChart
            data={(data?.byPriority ?? []).map((row) => ({
              name: PRIORITY_LABEL[row.key as keyof typeof PRIORITY_LABEL] ?? row.key,
              value: row.count,
              color: row.key === "HIGH" ? "var(--danger)" : row.key === "MEDIUM" ? "var(--warning)" : undefined,
            }))}
            centerLabel="Open"
            centerValue={String((data?.open ?? 0) + (data?.inReview ?? 0))}
            format="count"
          />
        </ChartCard>
      </div>
    </div>
  );
}
