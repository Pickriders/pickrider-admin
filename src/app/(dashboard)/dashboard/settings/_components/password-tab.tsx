"use client";

import { Check, Circle, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button, Field, Input, Panel, PanelHeader, cx } from "@/components/kit";
import { me } from "@/lib/admin/api";
import { useAction } from "@/lib/admin/hooks";
import { MIN_PASSWORD_LENGTH, passwordRules, passwordStrength, validatePasswordChange, type PasswordErrors } from "@/lib/admin/password";

/** Settings, Password tab: change the signed-in admin's password in place. */
const STRENGTH: Record<"weak" | "ok" | "strong", { label: string; bars: number; tone: string }> = {
  weak: { label: "Too short", bars: 1, tone: "bg-danger" },
  ok: { label: "Fine. Add numbers or symbols to make it stronger.", bars: 2, tone: "bg-warning" },
  strong: { label: "Strong password", bars: 3, tone: "bg-success" },
};

export function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({});

  const change = useAction((body: { oldPassword: string; newPassword: string; confirmPassword: string }) => me.changePassword(body), {
    success: "Password updated. Use the new one next time you sign in.",
    onSuccess: () => {
      setCurrent("");
      setNext("");
      setConfirm("");
      setErrors({});
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validatePasswordChange(current, next, confirm);
    setErrors(found);
    if (Object.keys(found).length) return;
    change.mutate({ oldPassword: current, newPassword: next, confirmPassword: confirm });
  };

  const strength = passwordStrength(next);
  const rules = passwordRules(current, next, confirm);
  const type = show ? "text" : "password";

  return (
    <Panel className="max-w-2xl">
      <PanelHeader
        title="Change password"
        subtitle="Use a strong password you do not use anywhere else"
        action={
          <button type="button" onClick={() => setShow((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
            {show ? "Hide" : "Show"}
          </button>
        }
      />
      <form onSubmit={onSubmit} noValidate className="space-y-4 p-5 pt-4">
        <Field label="Current password" error={errors.current}>
          <Input type={type} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Your current password" />
        </Field>
        <Field label="New password" error={errors.next}>
          <Input type={type} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`} />
        </Field>
        {strength ? (
          <div aria-live="polite">
            <div className="flex gap-1">
              {[1, 2, 3].map((bar) => (
                <span key={bar} className={cx("h-1.5 flex-1 rounded-full", bar <= STRENGTH[strength].bars ? STRENGTH[strength].tone : "bg-line")} />
              ))}
            </div>
            <p className="mt-1 text-[11px] font-semibold text-ink-muted">{STRENGTH[strength].label}</p>
          </div>
        ) : null}
        <Field label="Confirm new password" error={errors.confirm}>
          <Input type={type} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it again" />
        </Field>

        <ul className="space-y-1 rounded-xl bg-surface px-3 py-2.5">
          {rules.map((rule) => (
            <li key={rule.id} className={cx("flex items-center gap-2 text-xs", rule.met ? "text-success" : "text-ink-muted")}>
              {rule.met ? <Check size={13} strokeWidth={3} /> : <Circle size={11} />}
              {rule.label}
            </li>
          ))}
        </ul>

        <div className="flex justify-end pt-1">
          <Button type="submit" icon={KeyRound} loading={change.isPending} disabled={!current || !next || !confirm} className="w-full sm:w-auto">
            Update password
          </Button>
        </div>
      </form>
    </Panel>
  );
}
