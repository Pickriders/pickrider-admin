"use client";

import { CheckCircle2, Clock, Copy, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SupportEmailsInput } from "@/app/(dashboard)/admin/_components/support-emails";
import { Badge, Button, Drawer, cx, type Tone } from "@/components/kit";
import { ALL_EMAIL_TEMPLATES, emailTemplates, type EmailTemplate, type TestEmailsResult } from "@/lib/admin/api";
import { summariseQueued, templateTitle, testSendErrorMessage, testSendMessage } from "@/lib/admin/emails";
import { count } from "@/lib/admin/format";
import { useAction, useMe } from "@/lib/admin/hooks";
import { SUPPORT_EMAILS_MAX, cleanSupportEmails } from "@/lib/admin/support-emails";

type Scope = "one" | "all";

const OUTCOME: Record<string, { label: string; tone: Tone; icon: typeof Clock }> = {
  queued: { label: "Queued", tone: "info", icon: Clock },
  sent: { label: "Sent", tone: "success", icon: CheckCircle2 },
  failed: { label: "Failed", tone: "danger", icon: XCircle },
  duplicate: { label: "Already sent", tone: "neutral", icon: Copy },
};

/**
 * Sends sample emails ("[Test] " subject, sample data) to up to five addresses: the open template,
 * or every template in the registry. They go through the real queue and show up on the Messages
 * page as "Test send". The core allows 10 requests a minute per admin.
 */
export function TestSendDrawer({
  open,
  initialScope,
  template,
  totalTemplates,
  onClose,
}: {
  open: boolean;
  initialScope: Scope;
  template: EmailTemplate | null;
  totalTemplates: number;
  onClose: () => void;
}) {
  const me = useMe();
  const [recipients, setRecipients] = useState<string[]>([]);
  const [scope, setScope] = useState<Scope>(initialScope);
  const [result, setResult] = useState<TestEmailsResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setScope(template ? initialScope : "all");
    setResult(null);
  }, [open, initialScope, template]);

  // Start with the signed-in admin's own address; they can add up to four more.
  const myEmail = me.data?.email;
  useEffect(() => {
    if (myEmail && !recipients.length) setRecipients(cleanSupportEmails([myEmail]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myEmail]);

  const templateKey = scope === "one" && template ? template.key : ALL_EMAIL_TEMPLATES;
  const emails = scope === "one" ? 1 : totalTemplates;
  const total = emails * recipients.length;

  const send = useAction(
    (vars: { templateKey: string; recipients: string[] }) =>
      emailTemplates.sendTests(vars.templateKey, vars.recipients),
    {
      success: (data, vars) => testSendMessage(data, vars.recipients),
      error: testSendErrorMessage,
      invalidate: [["messages"]],
      onSuccess: (data) => setResult(data),
    },
  );

  const summary = summariseQueued(result?.queued);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Send test emails"
      subtitle="Sample data, with [Test] at the start of the subject."
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">
            {recipients.length ? (
              <>
                <span className="font-semibold text-ink">{count(total)}</span> email{total === 1 ? "" : "s"} to{" "}
                {recipients.length === 1 ? recipients[0] : `${recipients.length} addresses`}
              </>
            ) : (
              "Add at least one address"
            )}
          </p>
          <Button
            icon={Send}
            loading={send.isPending}
            disabled={!recipients.length || (scope === "one" && !template)}
            onClick={() => send.mutate({ templateKey, recipients })}
          >
            {scope === "all" ? `Send all ${count(emails)}` : "Send test"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-ink-muted">What to send</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <ScopeOption
              active={scope === "one"}
              disabled={!template}
              onClick={() => setScope("one")}
              title={template ? templateTitle(template.key) : "One email"}
              hint={template ? "The email open in the preview" : "Open an email in the gallery first"}
            />
            <ScopeOption
              active={scope === "all"}
              onClick={() => setScope("all")}
              title={`All ${count(totalTemplates)} emails`}
              hint="Every template, once per address"
            />
          </div>
        </fieldset>

        <SupportEmailsInput
          label="Send to"
          noun="test recipients"
          placeholder="you@pickriders.com"
          hint={`Up to ${SUPPORT_EMAILS_MAX} addresses. Press Enter or comma to add one.`}
          value={recipients}
          onChange={setRecipients}
          disabled={send.isPending}
        />

        {result ? (
          <div className="space-y-3 rounded-2xl border border-line p-4 admin-fade-up">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="mr-1 text-sm font-bold text-ink">{count(result.count)} handed to the queue</p>
              {Object.entries(summary)
                .filter(([, n]) => n > 0)
                .map(([outcome, n]) => (
                  <Badge key={outcome} tone={OUTCOME[outcome]?.tone ?? "neutral"}>
                    {count(n)} {OUTCOME[outcome]?.label.toLowerCase() ?? outcome}
                  </Badge>
                ))}
            </div>
            <ul className="admin-scroll max-h-72 divide-y divide-line overflow-y-auto">
              {result.queued.map((row) => {
                const outcome = OUTCOME[row.status];
                const Icon = outcome?.icon ?? Clock;
                return (
                  <li
                    key={`${row.templateKey}:${row.recipient}`}
                    className="flex items-center justify-between gap-3 py-2 text-xs"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{templateTitle(row.templateKey)}</span>
                      <span className="block truncate text-ink-muted">{row.recipient}</span>
                    </span>
                    <span
                      className={cx(
                        "inline-flex shrink-0 items-center gap-1 font-semibold",
                        outcome?.tone === "danger"
                          ? "text-danger"
                          : outcome?.tone === "success"
                            ? "text-success"
                            : "text-ink-muted",
                      )}
                    >
                      <Icon size={13} aria-hidden />
                      {outcome?.label ?? row.status}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="text-[11px] text-ink-faint">
              Queued emails usually arrive within a minute.{" "}
              <Link
                href="/messages?purpose=TEST&channel=EMAIL"
                className="font-semibold text-brand-dark hover:underline"
              >
                Follow them on the Messages page
              </Link>
              .
            </p>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}

function ScopeOption({
  active,
  disabled,
  onClick,
  title,
  hint,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active ? "border-brand bg-brand-soft" : "border-line bg-card hover:bg-surface",
      )}
    >
      <span className="block truncate text-sm font-bold text-ink">{title}</span>
      <span className="mt-0.5 block text-xs text-ink-muted">{hint}</span>
    </button>
  );
}
