"use client";

import { CheckCheck, Gift, LifeBuoy, Radar, Scale, UserCheck, X } from "lucide-react";
import { Suspense, useState } from "react";

import { HandoffsTable, type HandoffsMode } from "@/components/handoffs/handoffs-table";
import { HANDOFF_FLAG } from "@/components/handoffs/handoff-ui";
import { Avatar, Button, PageHeader, StatCard, Tabs, UserPicker, cx, type PickedUser } from "@/components/kit";
import { count, fullName } from "@/lib/admin/format";
import { useHandoffsSummary, useUser } from "@/lib/admin/hooks";
import { useAdminRealtime } from "@/lib/admin/realtime";
import { useTableState, useTabParam } from "@/lib/admin/url-state";

/**
 * Handoffs: riders who picked up an order and need another rider to finish it. Live is what is
 * happening now (accidents waiting on support, searches, riders on the way to the swap); the
 * review queue is completed swaps that were flagged or are holding a bonus; All is the history.
 */
const TABS = ["live", "review", "all"] as const;

function RiderFilter() {
  const table = useTableState();
  const riderId = table.state.filters.rider;
  const rider = useUser(riderId ?? "");
  const [picking, setPicking] = useState(false);

  if (riderId) {
    const name = fullName(rider.data) || "Selected rider";
    return (
      <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface pl-1.5 pr-1 text-sm">
        <Avatar src={rider.data?.photo} name={name} size={28} />
        <span className="max-w-[10rem] truncate font-semibold text-ink">{name}</span>
        <button type="button" aria-label="Clear rider filter" onClick={() => table.setFilter("rider", undefined)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-card hover:text-ink">
          <X size={14} />
        </button>
      </span>
    );
  }
  if (!picking) {
    return (
      <Button variant="outline" icon={UserCheck} onClick={() => setPicking(true)}>
        Rider
      </Button>
    );
  }
  return (
    <span className="relative block w-full sm:w-72">
      <UserPicker
        value={null}
        only="couriers"
        label="Either rider"
        hint="Handing over or taking over"
        onChange={(picked: PickedUser | null) => {
          if (picked) table.setFilter("rider", picked._id);
          setPicking(false);
        }}
      />
      <button type="button" onClick={() => setPicking(false)} className="absolute right-0 top-0 text-xs font-semibold text-ink-muted hover:text-ink">
        Close
      </button>
    </span>
  );
}

function HandoffsHub() {
  const [tab, setTab] = useTabParam<HandoffsMode>("live", TABS);
  const summary = useHandoffsSummary();
  const live = useAdminRealtime();
  const s = summary.data;
  const loading = summary.isLoading;
  const liveCount = s ? s.awaitingSupport + s.searching + s.accepted : undefined;

  return (
    <div>
      <PageHeader
        title="Handoffs"
        description={
          tab === "review"
            ? "Completed swaps that were flagged or are holding a bonus. Decide whether each counts against the rider who handed over."
            : "Riders who picked up an order and asked another rider to finish it."
        }
        actions={
          <span
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink-muted"
            title={live.connected ? "Updates arrive instantly" : "Live feed offline, refreshing every 20 seconds"}
          >
            <span className={cx("h-2 w-2 rounded-full", live.connected ? "bg-success" : "bg-ink-faint")} />
            {live.connected ? "Live" : "Refreshing every 20s"}
          </span>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Awaiting support"
          value={s ? <span className={s.awaitingSupport ? "text-danger" : undefined}>{count(s.awaitingSupport)}</span> : ""}
          icon={LifeBuoy}
          loading={loading}
          hint="Accidents, search not started"
          onClick={() => setTab("live")}
        />
        <StatCard label="Searching" value={s ? count(s.searching) : ""} icon={Radar} loading={loading} hint="Ringing nearby riders" onClick={() => setTab("live")} />
        <StatCard label="Rider on the way" value={s ? count(s.accepted) : ""} icon={UserCheck} loading={loading} hint="Accepted, heading to the swap" onClick={() => setTab("live")} />
        <StatCard
          label="Pending review"
          value={s ? count(s.pendingReview) : ""}
          icon={Scale}
          tone={s && s.pendingReview > 0 ? "dark" : "default"}
          loading={loading}
          hint="Flagged swaps"
          onClick={() => setTab("review")}
        />
        <StatCard label="Held bonuses" value={s ? count(s.heldBonuses) : ""} icon={Gift} loading={loading} hint="Waiting for release or forfeit" onClick={() => setTab("review")} />
        <StatCard label="Completed today" value={s ? count(s.completedToday) : ""} icon={CheckCheck} loading={loading} hint="Since midnight, Lagos time" onClick={() => setTab("all")} />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "live", label: "Live", count: liveCount },
          { id: "review", label: "Review queue", count: s?.pendingReview },
          { id: "all", label: "All" },
        ]}
      />

      {tab === "review" ? (
        <p className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-muted">
          {Object.values(HANDOFF_FLAG).map((flag) => (
            <span key={flag.label}>
              <span className="font-bold text-danger">{flag.label}</span> {flag.hint.toLowerCase()}
            </span>
          ))}
        </p>
      ) : null}

      <HandoffsTable key={tab} mode={tab} toolbarExtra={<RiderFilter />} csvName={`handoffs-${tab}`} />
    </div>
  );
}

export default function HandoffsPage() {
  return (
    <Suspense>
      <HandoffsHub />
    </Suspense>
  );
}
