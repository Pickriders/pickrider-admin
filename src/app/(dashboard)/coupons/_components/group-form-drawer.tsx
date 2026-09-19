"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, Drawer, Field, Input, UsersPicker, type PickedUser } from "@/components/kit";
import { coupons, type CouponGroup } from "@/lib/admin/api";
import { useAction } from "@/lib/admin/hooks";

/**
 * A group is a named set of customers plus the coupons they can see. Codes are typed one per
 * line or comma-separated; membership is edited from the group's page (add/remove by user id).
 */
export function GroupFormDrawer({
  open,
  onClose,
  group,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  group?: CouponGroup | null;
  onSaved?: (saved: CouponGroup) => void;
}) {
  const editing = Boolean(group);
  const [name, setName] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [members, setMembers] = useState<PickedUser[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(group?.name ?? "");
    setCodes((group?.coupons ?? []).map((c) => c.code));
    setCodeInput("");
    setMembers([]);
  }, [open, group]);

  const save = useAction(
    (input: { name: string; couponCodes: string[]; userIds?: string[] }) =>
      (group
        ? coupons.updateGroup(group._id, { name: input.name, couponCodes: input.couponCodes })
        : coupons.createGroup(input)) as Promise<CouponGroup>,
    {
      success: editing ? "Group updated." : "Group created.",
      invalidate: ["coupon-groups", "coupons", ...(group ? [["coupon-group", group._id]] : [])],
      onSuccess: (saved) => {
        onClose();
        onSaved?.(saved);
      },
    },
  );

  const addCodes = () => {
    const next = codeInput
      .split(/[\s,]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    if (!next.length) return;
    setCodes((prev) => Array.from(new Set([...prev, ...next])));
    setCodeInput("");
  };

  const valid = name.trim().length >= 6 && codes.length > 0;

  const submit = () => {
    if (!valid) return;
    const ids = members.map((m) => m._id);
    save.mutate({ name: name.trim(), couponCodes: codes, ...(!editing && ids.length ? { userIds: ids } : {}) });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${group?.name}` : "New coupon group"}
      subtitle="Targeted coupons (not marked 'everyone') only show to the members of a group they are attached to."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid} loading={save.isPending}>
            {editing ? "Save changes" : "Create group"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field
          label="Name"
          hint="At least 6 characters, e.g. 'vip-customers'."
          error={name && name.trim().length < 6 ? "Names are at least 6 characters." : undefined}
        >
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="vip-customers" />
        </Field>
        <Field label="Coupons" hint="Type a code and press Enter; paste several separated by commas.">
          <div className="flex gap-2">
            <Input
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCodes();
                }
              }}
              placeholder="WELCOME10"
              className="font-mono uppercase"
            />
            <Button variant="outline" onClick={addCodes} disabled={!codeInput.trim()}>
              Add
            </Button>
          </div>
          {codes.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {codes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-ink"
                >
                  {code}
                  <button
                    type="button"
                    aria-label={`Remove ${code}`}
                    onClick={() => setCodes((prev) => prev.filter((c) => c !== code))}
                    className="text-ink-faint hover:text-ink"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </Field>
        {!editing ? (
          <UsersPicker
            picked={members}
            onChange={setMembers}
            only="customers"
            label="Members (optional)"
            emptyHint="No members yet. You can add more from the group page."
          />
        ) : null}
      </div>
    </Drawer>
  );
}
