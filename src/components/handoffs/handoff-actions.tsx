"use client";

import { Ban, Gift, Play, Scale, UserMinus, UserPlus, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { ActionMenu, Button, ConfirmDialog, Field, Input, Select, Textarea, UserPicker, cx, type PickedUser } from "@/components/kit";
import { HandoffBonusAction, HandoffReason, HandoffReviewDecision, handoffs, type Handoff } from "@/lib/admin/api";
import { fullName, naira } from "@/lib/admin/format";
import { useAction } from "@/lib/admin/hooks";
import { useCan } from "@/lib/admin/use-can";

import { HANDOFF_REASON_LABEL, isLive, needsReview } from "./handoff-ui";

/**
 * Every staff lever on a handoff, with the confirmation each one needs. Live handoffs: start the
 * search (accident handoffs wait for support first), assign a rider directly, raise the bonus,
 * drop a no-show rider, or call it off. Completed and flagged: decide whether it counts and what
 * happens to a held bonus. Rendered as a "More" menu in tables and as buttons in panels.
 */
export const HANDOFF_INVALIDATE = [["handoffs"], ["order"], ["orders"], ["alerts"], ["rider-handoffs"]];

type Dialog = "search" | "assign" | "bonus" | "drop" | "cancel" | "review" | null;

const riderName = (rider: Handoff["fromRider"] | undefined, fallback: string) => fullName(rider) || fallback;

export function HandoffActions({
  handoff,
  variant = "menu",
  initialDecision,
}: {
  handoff: Handoff;
  variant?: "menu" | "buttons";
  /** Review queue rows open the review straight on Count or Waive. */
  initialDecision?: HandoffReviewDecision;
}) {
  const { can } = useCan();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [decision, setDecision] = useState<HandoffReviewDecision>(initialDecision ?? HandoffReviewDecision.WAIVE);
  if (!can("handoff.manage")) return null;

  const live = isLive(handoff);
  const items: { id: Exclude<Dialog, null>; label: string; icon: LucideIcon; tone?: "danger" | "warning"; primary?: boolean }[] = [];
  if (handoff.status === "AWAITING_SUPPORT") items.push({ id: "search", label: "Start search", icon: Play, primary: true });
  if (handoff.status === "SEARCHING" || handoff.status === "AWAITING_SUPPORT") items.push({ id: "assign", label: "Assign rider", icon: UserPlus, primary: handoff.status === "SEARCHING" });
  if (live) items.push({ id: "bonus", label: "Raise bonus", icon: Gift });
  if (handoff.status === "ACCEPTED") items.push({ id: "drop", label: "Drop rider", icon: UserMinus, tone: "warning" });
  if (live) items.push({ id: "cancel", label: "Cancel handoff", icon: Ban, tone: "danger" });
  if (needsReview(handoff)) items.push({ id: "review", label: "Review", icon: Scale, primary: true });

  const open = (id: Exclude<Dialog, null>) => {
    if (id === "review" && initialDecision) setDecision(initialDecision);
    setDialog(id);
  };

  return (
    <>
      {items.length ? (
        variant === "menu" ? (
          <span onClick={(event) => event.stopPropagation()}>
            <ActionMenu
              iconOnly
              title="Handoff actions"
              sections={[
                { id: "main", kind: "action" as const, items: items.filter((item) => item.tone !== "danger").map((item) => ({ id: item.id, label: item.label, icon: item.icon, tone: item.tone ?? ("neutral" as const), onSelect: () => open(item.id) })) },
                { id: "danger", kind: "action" as const, items: items.filter((item) => item.tone === "danger").map((item) => ({ id: item.id, label: item.label, icon: item.icon, tone: "danger" as const, onSelect: () => open(item.id) })) },
              ].filter((section) => section.items.length)}
            />
          </span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Button
                key={item.id}
                size="sm"
                icon={item.icon}
                variant={item.tone === "danger" ? "ghost" : item.primary ? "primary" : "outline"}
                className={cx(item.tone === "danger" && "text-danger hover:bg-danger-soft hover:text-danger")}
                onClick={() => open(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        )
      ) : null}
      <HandoffDialogs handoff={handoff} dialog={dialog} onClose={() => setDialog(null)} decision={decision} onDecision={setDecision} />
    </>
  );
}

/** Count / Waive buttons for a review queue row. */
export function ReviewButtons({ handoff }: { handoff: Handoff }) {
  const { can } = useCan();
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<HandoffReviewDecision>(HandoffReviewDecision.WAIVE);
  if (!can("handoff.manage") || !needsReview(handoff)) return null;
  const pick = (next: HandoffReviewDecision) => {
    setDecision(next);
    setOpen(true);
  };
  return (
    <span className="flex gap-1.5" onClick={(event) => event.stopPropagation()}>
      <Button size="sm" variant="outline" className="text-danger" onClick={() => pick(HandoffReviewDecision.COUNT)}>
        Count
      </Button>
      <Button size="sm" variant="outline" className="text-success" onClick={() => pick(HandoffReviewDecision.WAIVE)}>
        Waive
      </Button>
      <HandoffDialogs handoff={handoff} dialog={open ? "review" : null} onClose={() => setOpen(false)} decision={decision} onDecision={setDecision} />
    </span>
  );
}

function NoteField({ value, onChange, label = "Note (optional)", hint }: { value: string; onChange: (value: string) => void; label?: string; hint?: ReactNode }) {
  return (
    <Field label={label} hint={hint ?? "Kept on the handoff and in the audit log."}>
      <Textarea value={value} maxLength={300} onChange={(e) => onChange(e.target.value)} placeholder="What happened?" className="min-h-20" />
    </Field>
  );
}

function HandoffDialogs({
  handoff,
  dialog,
  onClose,
  decision,
  onDecision,
}: {
  handoff: Handoff;
  dialog: Dialog;
  onClose: () => void;
  decision: HandoffReviewDecision;
  onDecision: (next: HandoffReviewDecision) => void;
}) {
  const a = riderName(handoff.fromRider, "the rider");
  const b = riderName(handoff.toRider, "the taking rider");
  const [note, setNote] = useState("");
  const [rider, setRider] = useState<PickedUser | null>(null);
  const [bonusNaira, setBonusNaira] = useState("");
  const [bonusAction, setBonusAction] = useState<"" | HandoffBonusAction>("");

  const reset = () => {
    setNote("");
    setRider(null);
    setBonusNaira("");
    setBonusAction("");
  };
  const done = () => {
    reset();
    onClose();
  };
  const trimmed = note.trim() || undefined;
  const options = { invalidate: HANDOFF_INVALIDATE, onSuccess: done };

  const search = useAction(() => handoffs.startSearch(handoff.id, trimmed), { ...options, success: "Search started. Nearby riders are being rung." });
  const assign = useAction((riderId: string) => handoffs.assign(handoff.id, riderId), { ...options, success: (data) => `${riderName(data.toRider, "The rider")} is taking over. They have been told to meet ${a}.` });
  const bonus = useAction((amount: number) => handoffs.raiseBonus(handoff.id, amount), { ...options, success: (data) => `Bonus raised to ${naira(data.bonusAmount)}.` });
  const drop = useAction(() => handoffs.dropRider(handoff.id, trimmed), { ...options, success: `${b} was dropped. Searching again.` });
  const cancel = useAction(() => handoffs.cancel(handoff.id, trimmed), { ...options, success: `Handoff cancelled. ${a} keeps the order.` });
  const review = useAction(
    () => handoffs.review(handoff.id, { decision, bonus: bonusAction || undefined, note: trimmed }),
    { ...options, success: decision === HandoffReviewDecision.COUNT ? "Counted against the rider." : "Waived. It does not count." },
  );

  const close = (pending: boolean) => () => (pending ? undefined : done());
  const newBonus = Math.round(Number(bonusNaira || 0) * 100);
  const bonusValid = Number.isFinite(newBonus) && newBonus > handoff.bonusAmount;
  const held = handoff.bonusStatus === "HELD";

  return (
    <>
      <ConfirmDialog
        open={dialog === "search"}
        onClose={close(search.isPending)}
        onConfirm={() => search.mutate(undefined)}
        title="Start the search?"
        description={`Rings every free rider within ${handoff.searchRadiusKm} km of ${a}. Only start once you know ${a} is safe and the food can be handed over.`}
        confirmLabel="Start search"
        icon={Play}
        loading={search.isPending}
      >
        <NoteField value={note} onChange={setNote} />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "assign"}
        onClose={close(assign.isPending)}
        onConfirm={() => rider && assign.mutate(rider._id)}
        title="Assign a rider"
        description={`They take over straight away and get a push to meet ${a} and ask for the handoff code. Nobody else is rung.`}
        confirmLabel="Assign rider"
        icon={UserPlus}
        loading={assign.isPending}
        disabled={!rider || rider._id === handoff.fromRider?.id}
      >
        <UserPicker value={rider} onChange={setRider} only="couriers" label="Rider" hint="Name or phone. Pick someone close to the meeting point." />
        {rider && rider._id === handoff.fromRider?.id ? <p className="mt-2 text-xs font-semibold text-danger">That is the rider handing the order over.</p> : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "bonus"}
        onClose={close(bonus.isPending)}
        onConfirm={() => bonusValid && bonus.mutate(newBonus)}
        title="Raise the bonus"
        description={`Paid by Pickriders to the rider who takes over, with no commission. It is ${naira(handoff.bonusAmount)} now. Riders already rung see the new amount.`}
        confirmLabel={bonusValid ? `Raise to ${naira(newBonus)}` : "Raise bonus"}
        icon={Gift}
        loading={bonus.isPending}
        disabled={!bonusValid}
      >
        <Field label="New bonus" error={bonusNaira && !bonusValid ? `Must be more than ${naira(handoff.bonusAmount)}.` : undefined}>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="50"
            left={<span className="text-xs font-bold">₦</span>}
            value={bonusNaira}
            onChange={(e) => setBonusNaira(e.target.value)}
            placeholder={String(Math.round(handoff.bonusAmount / 100) + 200)}
            autoFocus
          />
        </Field>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "drop"}
        onClose={close(drop.isPending)}
        onConfirm={() => drop.mutate(undefined)}
        title={`Drop ${b}?`}
        description={`For a rider who accepted but is not coming. ${b} is taken off this handoff and is not rung for it again; the search starts over.`}
        confirmLabel="Drop rider"
        tone="warning"
        icon={UserMinus}
        loading={drop.isPending}
      >
        <NoteField value={note} onChange={setNote} />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "cancel"}
        onClose={close(cancel.isPending)}
        onConfirm={() => cancel.mutate(undefined)}
        title="Cancel this handoff?"
        description={
          handoff.status === "ACCEPTED"
            ? `${a} keeps the order. ${b} already accepted, so they are paid the cancel compensation now.`
            : `${a} keeps the order and finishes the delivery. Riders who were rung stop seeing it.`
        }
        confirmLabel="Cancel handoff"
        cancelLabel="Keep it"
        tone="danger"
        loading={cancel.isPending}
      >
        <NoteField value={note} onChange={setNote} />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "review"}
        onClose={close(review.isPending)}
        onConfirm={() => review.mutate(undefined)}
        title="Review this handoff"
        description={`Decide whether it counts against ${a} as a cancellation.${held ? ` ${b}'s ${naira(handoff.bonusAmount)} bonus is held until you release or forfeit it.` : ""}`}
        confirmLabel={decision === HandoffReviewDecision.COUNT ? "Count it" : "Waive it"}
        tone={decision === HandoffReviewDecision.COUNT ? "warning" : "primary"}
        icon={Scale}
        loading={review.isPending}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Decision">
            {[
              { value: HandoffReviewDecision.WAIVE, label: "Waive", hint: "Does not count" },
              { value: HandoffReviewDecision.COUNT, label: "Count", hint: "Counts as a cancellation" },
            ].map((option) => {
              const active = decision === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onDecision(option.value)}
                  className={cx(
                    "rounded-xl border px-3 py-2.5 text-left transition-colors",
                    active ? "border-transparent bg-ink text-card" : "border-line bg-card text-ink hover:bg-surface",
                  )}
                >
                  <span className="block text-sm font-bold">{option.label}</span>
                  <span className={cx("block text-[11px]", active ? "text-card/70" : "text-ink-muted")}>{option.hint}</span>
                </button>
              );
            })}
          </div>
          {held ? (
            <Field label="Held bonus" hint="Leave it held to decide later. Releasing pays it now if the order is finished, otherwise with the order.">
              <Select value={bonusAction} onChange={(e) => setBonusAction(e.target.value as "" | HandoffBonusAction)}>
                <option value="">Leave held</option>
                <option value={HandoffBonusAction.RELEASE}>Release {naira(handoff.bonusAmount)} to {b}</option>
                <option value={HandoffBonusAction.FORFEIT}>Forfeit it</option>
              </Select>
            </Field>
          ) : null}
          <NoteField value={note} onChange={setNote} />
        </div>
      </ConfirmDialog>
    </>
  );
}

/** Staff start a handoff for a rider who called in (the rider app has its own button). */
export function StartHandoffDialog({ orderId, riderName: holder, open, onClose }: { orderId: string; riderName: string; open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState<HandoffReason | "">("");
  const [note, setNote] = useState("");
  const start = useAction(
    () => handoffs.start({ orderId, reason: reason as HandoffReason, note: note.trim() || undefined }),
    {
      success: (data) => (data.status === "AWAITING_SUPPORT" ? "Handoff opened. Start the search once the rider is safe." : "Handoff started. Nearby riders are being rung."),
      invalidate: HANDOFF_INVALIDATE,
      onSuccess: () => {
        setReason("");
        setNote("");
        onClose();
      },
    },
  );
  return (
    <ConfirmDialog
      open={open}
      onClose={() => (start.isPending ? undefined : onClose())}
      onConfirm={() => reason && start.mutate(undefined)}
      title="Start a handoff"
      description={`Finds another rider to take this order from ${holder} at their live location. The new rider collects it with ${holder}'s handoff code; both are paid for their share of the trip.`}
      confirmLabel={reason === HandoffReason.ACCIDENT ? "Open handoff" : "Start handoff"}
      icon={UserPlus}
      loading={start.isPending}
      disabled={!reason}
    >
      <div className="space-y-3">
        <Field label="Reason" hint={reason === HandoffReason.ACCIDENT ? "Accidents do not ring anyone until you start the search." : undefined}>
          <Select value={reason} onChange={(e) => setReason(e.target.value as HandoffReason | "")} autoFocus>
            <option value="">Choose a reason</option>
            {Object.values(HandoffReason).map((value) => (
              <option key={value} value={value}>
                {HANDOFF_REASON_LABEL[value] ?? value}
              </option>
            ))}
          </Select>
        </Field>
        <NoteField value={note} onChange={setNote} />
      </div>
    </ConfirmDialog>
  );
}
