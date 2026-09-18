"use client";

import { useEffect, useState, type ChangeEvent } from "react";

import { Button, Drawer, Field, Input, Select, Switch, Textarea } from "@/components/kit";
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
  const toggle = (key: "isGeneral" | "isOneTime" | "isActive") => (checked: boolean) =>
    setDraft((d) => ({ ...d, [key]: checked }));

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
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Code"
            hint="At least 8 characters; stored uppercase."
            error={draft.code && !codeOk ? "Codes are at least 8 characters." : undefined}
          >
            <Input
              value={draft.code}
              onChange={set("code")}
              disabled={editing}
              placeholder="WELCOME10"
              className="font-mono uppercase"
            />
          </Field>
          <Field label="Name" hint="Shown to customers in the app.">
            <Input value={draft.name} onChange={set("name")} placeholder="Welcome offer" />
          </Field>
        </div>
        <Field label="Description">
          <Textarea
            value={draft.description}
            onChange={set("description")}
            rows={2}
            placeholder="10% off your first delivery."
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Type">
            <Select value={draft.type} onChange={set("type")} disabled={editing}>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed amount</option>
            </Select>
          </Field>
          <Field
            label={draft.type === "PERCENTAGE" ? "Percent off" : "Amount off (₦)"}
            error={draft.value && !percentOk ? "Percentages are 1 to 100." : undefined}
          >
            <Input type="number" min={1} value={draft.value} onChange={set("value")} disabled={editing} />
          </Field>
          <Field label="Currency">
            <Input
              value={draft.currency}
              onChange={set("currency")}
              disabled={editing}
              maxLength={3}
              className="uppercase"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {draft.type === "PERCENTAGE" ? (
            <Field label="Cap (₦)" hint="Most a percentage can take off. Optional.">
              <Input type="number" min={1} value={draft.maxDiscount} onChange={set("maxDiscount")} placeholder="2000" />
            </Field>
          ) : null}
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Switch
            checked={draft.isGeneral}
            onChange={toggle("isGeneral")}
            label="Everyone (off = group members only)"
          />
          <Switch checked={draft.isOneTime} onChange={toggle("isOneTime")} label="Once per customer" />
          <Switch checked={draft.isActive} onChange={toggle("isActive")} label="Active (off pauses redemptions)" />
        </div>
      </div>
    </Drawer>
  );
}
