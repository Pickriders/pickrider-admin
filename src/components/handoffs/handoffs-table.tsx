"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Check, Minus, Scale, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Badge, Button, ConfirmDialog, DataTable, Field, Select, Textarea, cx, type ColumnMeta, type FilterSpec } from "@/components/kit";
import { HandoffBonusAction, HandoffReviewDecision, handoffs, type Handoff, type HandoffBulkReviewResult, type Paged, type Query } from "@/lib/admin/api";
import { count, fullName, naira } from "@/lib/admin/format";
import { useAction, useHandoffs } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";
import { useCan } from "@/lib/admin/use-can";

import { HANDOFF_INVALIDATE, HandoffActions, ReviewButtons } from "./handoff-actions";
import {
  BonusCell,
  CountBadge,
  FlagChips,
  HANDOFF_REASON_LABEL,
  HANDOFF_STATUS_LABEL,
  HandoffIcon,
  HandoffStatusBadge,
  OrderLink,
  ReasonCell,
  RiderSwap,
  SplitCell,
  TimingCell,
  needsReview,
} from "./handoff-ui";

/**
 * The handoff list, used by the Handoffs page (Live, Review queue, All) and the courier's
 * Handoffs tab. Paging, filters and dates live in the URL like every admin table; the review
 * queue adds a page-level selection with a sticky bulk bar (Count / Waive, held bonuses).
 */
export type HandoffsMode = "live" | "review" | "all";
type HandoffRow = Handoff & Record<string, unknown>;

export const LIVE_STATUS = "AWAITING_SUPPORT,SEARCHING,ACCEPTED";

const meta = (value: ColumnMeta) => value;

const STATUS_FILTER: FilterSpec = {
  key: "status",
  label: "Status",
  options: Object.entries(HANDOFF_STATUS_LABEL).map(([value, label]) => ({ value, label })),
};
const FLAGGED_FILTER: FilterSpec = { key: "flagged", label: "Flags", options: [{ value: "true", label: "Flagged only" }] };

/** The query the list endpoint gets for a mode and the table's URL state. Exported for the test. */
export function handoffsQuery(mode: HandoffsMode, state: { page: number; limit: number; from?: string; to?: string; filters: Record<string, string> }, riderId?: string): Query {
  const { status, flagged, rider } = state.filters;
  return {
    page: state.page,
    limit: state.limit,
    riderId: riderId ?? rider,
    flagged: flagged === "true" ? true : undefined,
    from: state.from,
    to: state.to,
    ...(mode === "review" ? { review: "pending" } : { status: status || (mode === "live" ? LIVE_STATUS : undefined) }),
  };
}

function CheckBox({ checked, indeterminate, onChange, label, disabled }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className={cx(
        "grid h-[18px] w-[18px] place-items-center rounded-md border transition-colors disabled:opacity-40",
        checked || indeterminate ? "border-transparent bg-brand text-brand-ink" : "border-line-strong bg-card hover:border-brand",
      )}
    >
      {indeterminate ? <Minus size={12} strokeWidth={3} /> : checked ? <Check size={12} strokeWidth={3} /> : null}
    </button>
  );
}

function roleFor(handoff: Handoff, riderId: string) {
  if (handoff.fromRider?.id === riderId) return { label: "Handed over", tone: "warning" as const };
  if (handoff.toRider?.id === riderId) return { label: "Took over", tone: "brand" as const };
  return { label: "Rung", tone: "neutral" as const };
}

function buildColumns(mode: HandoffsMode, opts: { selection?: { ids: Set<string>; toggle: (id: string) => void; all: boolean; some: boolean; toggleAll: () => void; selectable: number }; riderId?: string }): ColumnDef<HandoffRow, unknown>[] {
  const cols: ColumnDef<HandoffRow, unknown>[] = [];
  const sel = opts.selection;
  if (sel) {
    cols.push({
      id: "select",
      header: () => <CheckBox checked={sel.all} indeterminate={!sel.all && sel.some} onChange={sel.toggleAll} label="Select all on this page" disabled={!sel.selectable} />,
      meta: meta({ width: "2.75rem", skeleton: "none" }),
      cell: ({ row }) =>
        needsReview(row.original) ? <CheckBox checked={sel.ids.has(row.original.id)} onChange={() => sel.toggle(row.original.id)} label={`Select order ${row.original.orderNumber ?? ""}`} /> : null,
    });
  }
  cols.push(
    {
      id: "order",
      header: "Order",
      meta: meta({ skeleton: "order", csv: { key: "orderNumber", label: "Order" } }),
      cell: ({ row }) => (
        <span className="flex flex-col items-start gap-1">
          <OrderLink handoff={row.original} />
          {opts.riderId ? <Badge tone={roleFor(row.original, opts.riderId).tone}>{roleFor(row.original, opts.riderId).label}</Badge> : null}
        </span>
      ),
    },
    {
      id: "riders",
      header: "From rider to rider",
      meta: meta({ skeleton: "person", csv: { key: "riders", label: "Riders", value: (row) => `${fullName((row as Handoff).fromRider)} -> ${fullName((row as Handoff).toRider) || "nobody"}` } }),
      cell: ({ row }) => <RiderSwap handoff={row.original} stacked />,
    },
    {
      id: "reason",
      header: "Reason",
      meta: meta({ hideBelow: "lg", skeleton: "lines", csv: { key: "reason", label: "Reason", value: (row) => HANDOFF_REASON_LABEL[(row as Handoff).reason] ?? (row as Handoff).reason } }),
      cell: ({ row }) => <ReasonCell handoff={row.original} />,
    },
    {
      id: "status",
      header: "Status",
      meta: meta({ skeleton: "badge", csv: { key: "status", label: "Status" } }),
      cell: ({ row }) => (
        <span className="flex flex-col items-start gap-1">
          <HandoffStatusBadge status={row.original.status} />
          <FlagChips flags={row.original.flags} />
        </span>
      ),
    },
    {
      id: "timing",
      header: "Timing",
      meta: meta({ hideBelow: "md", skeleton: "lines", csv: { key: "createdAt", label: "Asked at" } }),
      cell: ({ row }) => <TimingCell handoff={row.original} />,
    },
    {
      id: "split",
      header: "Split (A / B)",
      meta: meta({ hideBelow: "xl", skeleton: "lines", csv: { key: "fromShare", label: "A share (kobo)" } }),
      cell: ({ row }) => <SplitCell handoff={row.original} />,
    },
    {
      id: "bonus",
      header: "Bonus",
      meta: meta({ hideBelow: "lg", skeleton: "lines", csv: { key: "bonusAmount", label: "Bonus (kobo)" } }),
      cell: ({ row }) => <BonusCell handoff={row.original} />,
    },
  );
  if (mode !== "live") {
    cols.push({
      id: "count",
      header: "Counts?",
      meta: meta({ hideBelow: "md", skeleton: "badge", csv: { key: "countDecision", label: "Count decision" } }),
      cell: ({ row }) => <CountBadge handoff={row.original} />,
    });
  }
  cols.push({
    id: "actions",
    header: "",
    meta: meta({ align: "right", width: mode === "review" ? "11rem" : "4rem", skeleton: "button" }),
    cell: ({ row }) => (
      <span className="flex items-center justify-end gap-1.5">
        {mode === "review" ? <ReviewButtons handoff={row.original} /> : null}
        <HandoffActions handoff={row.original} />
      </span>
    ),
  });
  return cols;
}

export function HandoffCard({ handoff, riderId, selection }: { handoff: Handoff; riderId?: string; selection?: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {selection}
          <OrderLink handoff={handoff} />
          {riderId ? <Badge tone={roleFor(handoff, riderId).tone}>{roleFor(handoff, riderId).label}</Badge> : null}
        </div>
        <HandoffStatusBadge status={handoff.status} />
      </div>
      <RiderSwap handoff={handoff} stacked />
      <div className="grid grid-cols-2 gap-3">
        <ReasonCell handoff={handoff} />
        <TimingCell handoff={handoff} />
        <SplitCell handoff={handoff} />
        <BonusCell handoff={handoff} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FlagChips flags={handoff.flags} />
        {handoff.status === "COMPLETED" ? <CountBadge handoff={handoff} /> : null}
        <span className="ml-auto flex items-center gap-1.5">
          <ReviewButtons handoff={handoff} />
          <HandoffActions handoff={handoff} />
        </span>
      </div>
    </div>
  );
}

export function HandoffsTable({
  mode,
  riderId,
  toolbarExtra,
  csvName = "handoffs",
}: {
  mode: HandoffsMode;
  /** Fix the list to one rider (courier details); otherwise the `rider` URL filter applies. */
  riderId?: string;
  toolbarExtra?: ReactNode;
  csvName?: string;
}) {
  const table = useTableState({ limit: 20 });
  const query = useMemo(() => handoffsQuery(mode, table.state, riderId), [mode, table.state, riderId]);
  const list = useHandoffs(query);
  const rows = useMemo(() => list.data?.items ?? [], [list.data]);
  const { can } = useCan();
  const bulk = mode === "review" && can("handoff.manage");

  // Selection is per page: it clears when the page, filters or mode change.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const key = JSON.stringify(query);
  useEffect(() => setSelected(new Set()), [key]);
  // Drop ids that left the page after a refresh (reviewed by someone else).
  useEffect(() => {
    setSelected((current) => {
      const present = new Set(rows.filter(needsReview).map((row) => row.id));
      const next = new Set([...current].filter((id) => present.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [rows]);

  const reviewable = useMemo(() => rows.filter(needsReview), [rows]);
  const selection = useMemo(
    () =>
      bulk
        ? {
            ids: selected,
            selectable: reviewable.length,
            all: reviewable.length > 0 && reviewable.every((row) => selected.has(row.id)),
            some: selected.size > 0,
            toggle: (id: string) =>
              setSelected((current) => {
                const next = new Set(current);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              }),
            toggleAll: () =>
              setSelected((current) => (reviewable.every((row) => current.has(row.id)) ? new Set() : new Set(reviewable.map((row) => row.id)))),
          }
        : undefined,
    [bulk, selected, reviewable],
  );

  const columns = useMemo(() => buildColumns(mode, { selection, riderId }), [mode, selection, riderId]);
  const filters = mode === "review" ? [FLAGGED_FILTER] : [STATUS_FILTER, FLAGGED_FILTER];

  return (
    <div>
      <DataTable<HandoffRow>
        columns={columns}
        data={list.data as Paged<HandoffRow> | undefined}
        loading={list.isLoading || list.isFetching}
        error={list.isError ? errorMessage(list.error) : null}
        onRetry={() => void list.refetch()}
        searchable={false}
        filters={filters}
        toolbarExtra={toolbarExtra}
        csvName={csvName}
        density="compact"
        mobileCard={(row) => (
          <HandoffCard
            handoff={row}
            riderId={riderId}
            selection={selection && needsReview(row) ? <CheckBox checked={selected.has(row.id)} onChange={() => selection.toggle(row.id)} label={`Select order ${row.orderNumber ?? ""}`} /> : undefined}
          />
        )}
        emptyIcon={mode === "review" ? Scale : HandoffIcon}
        emptyTitle={mode === "live" ? "No live handoffs" : mode === "review" ? "Review queue is clear" : "No handoffs yet"}
        emptyDescription={
          mode === "live"
            ? "When a rider asks to hand an order over, it shows up here until another rider has it."
            : mode === "review"
              ? "Flagged swaps and held bonuses land here. Unreviewed ones settle by the rules after 72 hours; held bonuses wait for you."
              : riderId
                ? "Orders this rider handed over or took over show up here."
                : "Handoffs riders ask for after pickup show up here."
        }
      />
      {bulk && selected.size ? <BulkBar ids={[...selected]} rows={reviewable} onDone={() => setSelected(new Set())} onClear={() => setSelected(new Set())} /> : null}
    </div>
  );
}

/** "12 updated", or what failed and why, after a bulk review. Exported for the test. */
export function bulkSummary(results: HandoffBulkReviewResult[]) {
  const updated = results.reduce((sum, r) => sum + r.updated, 0);
  const failed = results.flatMap((r) => r.results.filter((row) => !row.ok));
  return {
    updated,
    failed: failed.length,
    message: failed.length
      ? `${count(updated)} updated, ${count(failed.length)} not: ${failed[0]?.error ?? "they changed in the meantime"}`
      : `${count(updated)} handoff${updated === 1 ? "" : "s"} reviewed.`,
  };
}

function BulkBar({ ids, rows, onDone, onClear }: { ids: string[]; rows: Handoff[]; onDone: () => void; onClear: () => void }) {
  const [decision, setDecision] = useState<HandoffReviewDecision | null>(null);
  const [bonus, setBonus] = useState<"" | HandoffBonusAction>("");
  const [note, setNote] = useState("");
  const picked = rows.filter((row) => ids.includes(row.id));
  const heldIds = picked.filter((row) => row.bonusStatus === "HELD").map((row) => row.id);
  const heldTotal = picked.filter((row) => row.bonusStatus === "HELD").reduce((sum, row) => sum + row.bonusAmount, 0);
  const flagged = picked.filter((row) => row.flags.length).length;

  const run = useAction(
    async (vars: { decision: HandoffReviewDecision; bonus: "" | HandoffBonusAction; note?: string }) => {
      // A bonus action is only valid on held bonuses, so those go in their own call.
      const held = vars.bonus ? ids.filter((id) => heldIds.includes(id)) : [];
      const rest = ids.filter((id) => !held.includes(id));
      const calls: Promise<HandoffBulkReviewResult>[] = [];
      if (held.length) calls.push(handoffs.bulkReview({ ids: held, decision: vars.decision, bonus: vars.bonus || undefined, note: vars.note }));
      if (rest.length) calls.push(handoffs.bulkReview({ ids: rest, decision: vars.decision, note: vars.note }));
      return bulkSummary(await Promise.all(calls));
    },
    {
      invalidate: HANDOFF_INVALIDATE,
      onSuccess: (summary) => {
        if (summary.failed) toast.warning(summary.message);
        else toast.success(summary.message);
        setDecision(null);
        setBonus("");
        setNote("");
        onDone();
      },
    },
  );

  return (
    <>
      <div className="pointer-events-none sticky bottom-4 z-20 mt-4 flex justify-center admin-fade-up">
        <div className="pointer-events-auto flex w-full max-w-2xl flex-wrap items-center gap-2 rounded-2xl border border-line bg-ink px-4 py-3 text-card shadow-pop sm:flex-nowrap">
          <span className="mr-auto text-sm font-bold">
            {count(ids.length)} selected
            {heldIds.length ? <span className="ml-2 text-xs font-semibold text-card/70">{`${count(heldIds.length)} with a held bonus`}</span> : null}
          </span>
          <button type="button" onClick={() => setDecision(HandoffReviewDecision.COUNT)} className="h-9 rounded-xl bg-danger px-3.5 text-sm font-bold text-white hover:brightness-95">
            Count
          </button>
          <button type="button" onClick={() => setDecision(HandoffReviewDecision.WAIVE)} className="h-9 rounded-xl bg-success px-3.5 text-sm font-bold text-white hover:brightness-95">
            Waive
          </button>
          <button type="button" aria-label="Clear selection" onClick={onClear} className="grid h-9 w-9 place-items-center rounded-xl text-card/70 hover:bg-card/10 hover:text-card">
            <X size={16} />
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={decision !== null}
        onClose={() => (run.isPending ? undefined : setDecision(null))}
        onConfirm={() => decision && run.mutate({ decision, bonus, note: note.trim() || undefined })}
        title={decision === HandoffReviewDecision.COUNT ? `Count ${count(ids.length)} handoffs?` : `Waive ${count(ids.length)} handoffs?`}
        description={
          decision === HandoffReviewDecision.COUNT
            ? `Each one counts as a cancellation for the rider who handed it over.${flagged ? ` ${count(flagged)} of them are flagged.` : ""}`
            : "None of them count against the riders who handed them over."
        }
        confirmLabel={decision === HandoffReviewDecision.COUNT ? "Count them" : "Waive them"}
        tone={decision === HandoffReviewDecision.COUNT ? "warning" : "primary"}
        icon={Scale}
        loading={run.isPending}
      >
        <div className="space-y-3">
          {heldIds.length ? (
            <Field label={`Held bonuses (${count(heldIds.length)}, ${naira(heldTotal)})`} hint="Applies only to the selected handoffs with a held bonus.">
              <Select value={bonus} onChange={(e) => setBonus(e.target.value as "" | HandoffBonusAction)}>
                <option value="">Leave held</option>
                <option value={HandoffBonusAction.RELEASE}>Release them</option>
                <option value={HandoffBonusAction.FORFEIT}>Forfeit them</option>
              </Select>
            </Field>
          ) : null}
          <Field label="Note (optional)" hint="Saved on every selected handoff.">
            <Textarea value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} className="min-h-20" />
          </Field>
        </div>
      </ConfirmDialog>
    </>
  );
}
