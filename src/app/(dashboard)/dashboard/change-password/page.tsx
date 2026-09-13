"use client";

import Link from "next/link";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { me } from "@/lib/admin/api";
import { useAction } from "@/lib/admin/hooks";
import { Button, Field, Input, PageHeader, Panel, PanelHeader } from "@/components/kit/primitives";

/** Change the signed-in admin's password. Checks happen here before the API sees anything. */
const MIN_LENGTH = 8;

type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const change = useAction((body: { oldPassword: string; newPassword: string; confirmPassword: string }) => me.changePassword(body), {
    success: "Password updated. Use the new one next time you sign in.",
    onSuccess: () => {
      setCurrent("");
      setNext("");
      setConfirm("");
      setErrors({});
      router.push("/dashboard/profile");
    },
  });

  const validate = (): Errors => {
    const found: Errors = {};
    if (!current) found.current = "Enter your current password.";
    if (next.length < MIN_LENGTH) found.next = `Use at least ${MIN_LENGTH} characters.`;
    else if (next === current) found.next = "Pick a password you have not used here before.";
    if (confirm !== next) found.confirm = "The two passwords do not match.";
    return found;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    change.mutate({ oldPassword: current, newPassword: next, confirmPassword: confirm });
  };

  const strength = next.length >= 12 && /[A-Z]/.test(next) && /[0-9]/.test(next) && /[^A-Za-z0-9]/.test(next) ? "strong" : next.length >= MIN_LENGTH ? "ok" : next ? "weak" : null;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumb={
          <>
            <Link href="/dashboard" className="hover:text-ink">
              Dashboard
            </Link>
            <span className="mx-1">/</span>
            <Link href="/dashboard/profile" className="hover:text-ink">
              Profile
            </Link>
          </>
        }
        title="Change password"
        description="Use a strong password you do not use anywhere else."
      />

      <Panel className="max-w-xl">
        <PanelHeader
          title="New password"
          subtitle={`At least ${MIN_LENGTH} characters. Longer with numbers and symbols is better.`}
          action={
            <button type="button" onClick={() => setShow((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink">
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
              {show ? "Hide" : "Show"}
            </button>
          }
        />
        <form onSubmit={onSubmit} noValidate className="space-y-4 p-5 pt-4">
          <Field label="Current password" error={errors.current}>
            <Input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Your current password"
            />
          </Field>
          <Field
            label="New password"
            error={errors.next}
            hint={strength === "strong" ? "Strong password." : strength === "ok" ? "Fine. Add numbers or symbols to make it stronger." : strength === "weak" ? `Too short, needs ${MIN_LENGTH - next.length} more.` : undefined}
          >
            <Input type={show ? "text" : "password"} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder={`At least ${MIN_LENGTH} characters`} />
          </Field>
          <Field label="Confirm new password" error={errors.confirm}>
            <Input type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it again" />
          </Field>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/profile")} disabled={change.isPending}>
              Cancel
            </Button>
            <Button type="submit" icon={KeyRound} loading={change.isPending} disabled={!current || !next || !confirm}>
              Update password
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
