"use client";

import { Globe, Pause, Play, Repeat, UserRound, Users, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";

import { Button, Drawer, Field, Input, Select, Textarea, cx } from "@/components/kit";
import { coupons, type Coupon, type CouponInput, type CouponType, type CouponUpdate } from "@/lib/admin/api";
import { useAction } from "@/lib/admin/hooks";

/**
 * Create a coupon, or edit the fields that are safe to change once it exists. Code, type, value
 * and currency lock after creation so a live promotion never changes under the customers who
 * already saw it. Money fields are typed in naira and sent in kobo.
 */
type Draft = {
  code: string;
  name: string;
  description: string;
  currency: string;
  type: CouponType;
  value: string;
  maxDiscount: string;
  expirationDate: string;
  limit: string;
  isGeneral: boolean;
  isOneTime: boolean;
  isActive: boolean;
};

const toDateInput = (value?: string) => (value ? new Date(value).toISOString().slice(0, 10) : "");
const inThirtyDays = () => new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

const EMPTY: Draft = {
  code: "",
  name: "",
  description: "",
  currency: "NGN",
  type: "PERCENTAGE",
  value: "10",
  maxDiscount: "",
  expirationDate: inThirtyDays(),
  limit: "100",
  isGeneral: true,
  isOneTime: true,
  isActive: true,
};

export function CouponFormDrawer({
  open,
  onClose,
  coupon,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
  onSaved?: (saved: Coupon) => void;
}) {
  const editing = Boolean(coupon);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setDraft(
      coupon
        ? {
            code: coupon.code,
            name: coupon.name ?? "",
            description: coupon.description ?? "",
            currency: coupon.currency,
            type: coupon.type,
            value: coupon.type === "PERCENTAGE" ? String(coupon.value) : String(coupon.value / 100),
            maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount / 100) : "",
            expirationDate: toDateInput(coupon.expirationDate),
            limit: String(coupon.limit),
            isGeneral: coupon.isGeneral,
            isOneTime: coupon.isOneTime,
            isActive: coupon.isActive,
          }
        : { ...EMPTY, expirationDate: inThirtyDays() },
    );
  }, [open, coupon]);

  const save = useAction(
    (input: { create?: CouponInput; update?: CouponUpdate }) =>
      (coupon
        ? coupons.update(coupon._id, input.update as CouponUpdate)
        : coupons.create(input.create as CouponInput)) as Promise<Coupon>,
    {
      success: editing ? "Coupon updated." : "Coupon created.",
      invalidate: ["coupons", ...(coupon ? [["coupon", coupon._id]] : [])],
      onSuccess: (saved) => {
        onClose();
        onSaved?.(saved);
      },
    },
  );

  const set = (key: keyof Draft) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [key]: event.target.value }));

  const value = Number(draft.value);
  const limit = Number(draft.limit);
  const maxDiscount = draft.maxDiscount ? Number(draft.maxDiscount) : undefined;
  const percentOk = draft.type !== "PERCENTAGE" || (value > 0 && value <= 100);
  const codeOk = draft.code.trim().length >= 8;
  const nameOk = !draft.name.trim() || draft.name.trim().length >= 4;
  const expiryOk = Boolean(draft.expirationDate) && new Date(draft.expirationDate).getTime() > Date.now();
  const limitOk = limit >= 1 && (!coupon || limit >= coupon.usageCount);
  const valid =
    (editing || (codeOk && value > 0 && percentOk)) &&
    nameOk &&
    expiryOk &&
    limitOk &&
    (maxDiscount === undefined || maxDiscount > 0);

  const submit = () => {
    if (!valid) return;
    const expirationDate = new Date(`${draft.expirationDate}T23:59:59`).toISOString();
    if (coupon) {
      save.mutate({
        update: {
          name: draft.name.trim() || undefined,
          description: draft.description.trim() || undefined,
          expirationDate,
          limit,
          maxDiscount: draft.type === "PERCENTAGE" && maxDiscount ? Math.round(maxDiscount * 100) : undefined,
          isGeneral: draft.isGeneral,
          isOneTime: draft.isOneTime,
          isActive: draft.isActive,
        },
      });
      return;
    }
    save.mutate({
      create: {
        code: draft.code.trim().toUpperCase().replace(/\s+/g, ""),
        name: draft.name.trim() || undefined,
        description: draft.description.trim() || undefined,
        currency: draft.currency.trim().toUpperCase(),
        type: draft.type,
        value: draft.type === "PERCENTAGE" ? value : Math.round(value * 100),
        maxDiscount: draft.type === "PERCENTAGE" && maxDiscount ? Math.round(maxDiscount * 100) : undefined,
        expirationDate,
        limit,
        isGeneral: draft.isGeneral,
        isOneTime: draft.isOneTime,
        isActive: draft.isActive,
      },
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${coupon?.code}` : "New coupon"}
      subtitle={
        editing
          ? "Code, type, value and currency are locked once a coupon exists."
          : "Customers apply the code at checkout; targeted coupons only show to members of a group."
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid} loading={save.isPending}>
            {editing ? "Save changes" : "Create coupon"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Section step={1} title="The offer" hint="What customers see and get.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Code"
              hint="At least 8 characters; stored uppercase."
              error={draft.code && !codeOk ? "Codes are at least 8 characters." : undefined}
            >
              <Input value={draft.code} onChange={set("code")} disabled={editing} placeholder="WELCOME10" className="font-mono uppercase" />
            </Field>
            <Field label="Name" hint="Shown to customers in the app.">
              <Input value={draft.name} onChange={set("name")} placeholder="Welcome offer" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea value={draft.description} onChange={set("description")} rows={2} placeholder="10% off your first delivery." />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Type">
              <Select value={draft.type} onChange={set("type")} disabled={editing}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed amount</option>
              </Select>
            </Field>
            <Field label={draft.type === "PERCENTAGE" ? "Percent off" : "Amount off (₦)"} error={draft.value && !percentOk ? "Percentages are 1 to 100." : undefined}>
              <Input type="number" min={1} value={draft.value} onChange={set("value")} disabled={editing} />
            </Field>
            {draft.type === "PERCENTAGE" ? (
              <Field label="Cap (₦)" hint="Most it can take off. Optional.">
                <Input type="number" min={1} value={draft.maxDiscount} onChange={set("maxDiscount")} placeholder="2000" />
              </Field>
            ) : (
              <Field label="Currency">
                <Input value={draft.currency} onChange={set("currency")} disabled={editing} maxLength={3} className="uppercase" />
              </Field>
            )}
          </div>
        </Section>

        <Section step={2} title="Limits" hint="How many times it can be used and until when.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Total redemptions"
              hint={coupon ? `${coupon.usageCount} used so far.` : "Across all customers."}
              error={draft.limit && !limitOk ? "Cannot go below redemptions already recorded." : undefined}
            >
              <Input type="number" min={1} value={draft.limit} onChange={set("limit")} />
            </Field>
            <Field label="Expires" error={draft.expirationDate && !expiryOk ? "Pick a date in the future." : undefined}>
              <Input type="date" value={draft.expirationDate} onChange={set("expirationDate")} />
            </Field>
          </div>
          <Choice
            label="Per customer"
            value={draft.isOneTime ? "once" : "repeat"}
            onChange={(next) => setDraft((d) => ({ ...d, isOneTime: next === "once" }))}
            options={[
              { id: "once", icon: UserRound, label: "Once per customer", hint: "Each customer can redeem it one time" },
              { id: "repeat", icon: Repeat, label: "Reusable", hint: "The same customer can redeem it again, until the total runs out" },
            ]}
          />
        </Section>

        <Section step={3} title="Who can use it" hint="Targeted coupons only show to members of a group.">
          <Choice
            label="Audience"
            value={draft.isGeneral ? "everyone" : "group"}
            onChange={(next) => setDraft((d) => ({ ...d, isGeneral: next === "everyone" }))}
            options={[
              { id: "everyone", icon: Globe, label: "Everyone", hint: "Any customer can apply it at checkout" },
              { id: "group", icon: Users, label: "Group members only", hint: "Add it to a group on the Groups tab; only its members see it" },
            ]}
          />
        </Section>

        <Section step={4} title="Availability" hint="A paused coupon keeps its numbers but cannot be redeemed.">
          <Choice
            label="Status"
            value={draft.isActive ? "active" : "paused"}
            onChange={(next) => setDraft((d) => ({ ...d, isActive: next === "active" }))}
            options={[
              { id: "active", icon: Play, label: "Active", hint: editing ? "Redeemable right away" : "Live as soon as it is created" },
              { id: "paused", icon: Pause, label: "Paused", hint: "Saved, but nobody can redeem it yet" },
            ]}
          />
        </Section>
      </div>
    </Drawer>
  );
}

/** A numbered block of the form, so the drawer reads top to bottom as steps. */
function Section({ step, title, hint, children }: { step: number; title: string; hint: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-xs font-black text-card">{step}</span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          <p className="text-xs text-ink-muted">{hint}</p>
        </div>
      </div>
      <div className="space-y-4 sm:pl-10">{children}</div>
    </section>
  );
}

/**
 * Two or three labelled cards for a yes-or-no setting. Each card says what
 * picking it means, so nobody has to guess which way a switch points.
 */
function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: { id: T; icon: LucideIcon; label: string; hint: string }[];
}) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-1.5 text-xs font-semibold text-ink-muted">{label}</p>
      <div className={cx("grid grid-cols-1 gap-2", options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {options.map((option) => {
          const active = option.id === value;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className={cx(
                "flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors",
                active ? "border-brand bg-brand-soft/60" : "border-line bg-card hover:bg-surface",
              )}
            >
              <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", active ? "bg-brand text-brand-ink" : "bg-surface text-ink-muted")}>
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">{option.label}</span>
                <span className="block text-[11px] leading-snug text-ink-muted">{option.hint}</span>
              </span>
              <span className={cx("ml-auto mt-1 h-4 w-4 shrink-0 rounded-full border-2", active ? "border-brand bg-brand" : "border-line-strong")} aria-hidden>
                {active ? <span className="block h-full w-full scale-50 rounded-full bg-card" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
