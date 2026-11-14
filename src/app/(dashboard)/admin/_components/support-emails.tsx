"use client";

import { Send, X } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";

import { Button, cx } from "@/components/kit";
import { alerts } from "@/lib/admin/api";
import { useAction } from "@/lib/admin/hooks";
import { SUPPORT_EMAILS_MAX, addSupportEmails, testEmailSentMessage } from "@/lib/admin/support-emails";
import { useCan } from "@/lib/admin/use-can";

/**
 * Support emails as removable chips with one input: Enter, comma, space or leaving the box adds
 * what was typed (a pasted list too). Not wrapped in the kit Field, whose <label> would forward a
 * click on the hint to the first chip's remove button.
 */
export function SupportEmailsInput({
  label = "Support emails",
  hint,
  value,
  onChange,
  disabled,
}: {
  label?: string;
  hint: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const full = value.length >= SUPPORT_EMAILS_MAX;

  const commit = (raw = text) => {
    if (!raw.trim()) {
      setError(null);
      return;
    }
    const next = addSupportEmails(value, raw);
    if (next.list.length !== value.length) onChange(next.list);
    setText(next.rejected.join(", "));
    setError(next.error);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === ";" || event.key === " ") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-muted">
        {label} <span className="font-normal text-ink-faint">({value.length}/{SUPPORT_EMAILS_MAX})</span>
      </label>
      <div
        className={cx(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border bg-card px-2 py-1.5 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25",
          error ? "border-danger" : "border-line",
          disabled && "opacity-60",
        )}
      >
        {value.map((email) => (
          <span key={email} className="inline-flex max-w-full items-center gap-1 rounded-full bg-surface py-0.5 pl-2.5 pr-1 text-xs font-semibold text-ink">
            <span className="truncate">{email}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(value.filter((e) => e !== email))}
              aria-label={`Remove ${email}`}
              className="grid h-5 w-5 place-items-center rounded-full text-ink-faint hover:bg-card hover:text-danger disabled:cursor-not-allowed"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="off"
          disabled={disabled || (full && !text)}
          placeholder={full ? "Remove one to add another" : value.length ? "Add another" : "support@pickriders.com"}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => commit()}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");
            if (!/[\s,;]/.test(pasted.trim())) return;
            e.preventDefault();
            commit(`${text} ${pasted}`);
          }}
          className="h-7 min-w-[10rem] flex-1 bg-transparent px-1 text-sm text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
      {error ? <span className="mt-1 block text-xs font-medium text-danger">{error}</span> : <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </div>
  );
}

/**
 * Sends a sample urgent alert email to the saved list (a state's, or the platform's with no codes).
 * Disabled while the form has unsaved changes, since the server mails what is saved.
 */
export function TestEmailButton({
  body,
  dirty,
  note,
}: {
  body: { countryCode?: string; stateCode?: string };
  dirty: boolean;
  /** Shown beside the button when nothing is unsaved, e.g. where an empty state list falls back to. */
  note?: string | null;
}) {
  const canWrite = useCan().can("settings.write");
  const send = useAction(() => alerts.testEmail(body), { success: (data) => testEmailSentMessage(data.sentTo) });
  if (!canWrite) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <Button type="button" size="sm" variant="outline" icon={Send} loading={send.isPending} disabled={dirty} onClick={() => send.mutate(undefined)}>
        Send test email
      </Button>
      {dirty ? (
        <span className="text-[11px] font-semibold text-ink-faint">Save first</span>
      ) : note ? (
        <span className="text-[11px] text-ink-faint">{note}</span>
      ) : null}
    </span>
  );
}
