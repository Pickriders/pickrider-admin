"use client";

import { Check, Copy, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Badge, cx, statusTone } from "@/components/kit";
import type { OrderStop } from "@/lib/admin/api";
import { naira, when } from "@/lib/admin/format";

import { STOP_STATUS_LABEL, displayPhone, phoneHref, sortedStops, stopCodes, stopContact } from "../../lib";

/**
 * Pickup(s) then drop-offs, lettered to match the map, each with its own
 * status, contact, package and the confirmation code the rider will be asked
 * for. Codes copy on tap: ops use them to recover a stuck delivery.
 */
function CodeChip({ code, name, status }: { code: string; name?: string; status?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => undefined);
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy confirmation code"
      className={cx(
        "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-ink transition-colors hover:border-line-strong",
        status === "COMPLETED" && "opacity-70",
      )}
    >
      <ShieldCheck size={12} className="text-brand-dark" />
      {name ? <span className="text-ink-muted">{name}</span> : null}
      <span className="font-mono tracking-[0.15em]">{code}</span>
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-ink-faint" />}
    </button>
  );
}

const DOT: Record<string, string> = {
  PICKUP: "bg-info text-white",
  DROPOFF: "bg-brand text-white",
};

export function StopsTimeline({ stops }: { stops: OrderStop[] }) {
  const ordered = sortedStops({ locations: stops });
  if (!ordered.length) return <p className="px-5 pb-5 text-sm text-ink-faint">This order has no stops recorded.</p>;

  return (
    <ol className="relative space-y-0 px-5 pb-5">
      {ordered.map((stop, index) => {
        const contact = stopContact(stop);
        const codes = stopCodes(stop);
        const pickup = stop.type === "PICKUP";
        const last = index === ordered.length - 1;
        const lastAt = stop.completedAt ?? stop.cancelledAt ?? stop.arrivedAt ?? stop.startedAt;
        return (
          <li key={stop._id ?? index} className="relative flex gap-3 pb-5">
            {!last ? <span className="absolute left-[13px] top-7 h-[calc(100%-1rem)] w-px bg-line" aria-hidden /> : null}
            <span className={cx("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-black", DOT[stop.type ?? "DROPOFF"])}>
              {String.fromCharCode(65 + index)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                  {pickup ? "Pickup" : "Drop-off"}
                  {stop.distanceTo ? ` · ${stop.distanceTo.toFixed(1)} km` : ""}
                  {stop.amountTo ? ` · ${naira(stop.amountTo)}` : ""}
                </p>
                <Badge tone={statusTone(stop.status)} dot>
                  {STOP_STATUS_LABEL[stop.status ?? ""] ?? stop.status ?? "Pending"}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink">{stop.address}</p>

              {contact.name || contact.phone ? (
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
                  <span>{contact.name || (pickup ? "Sender" : "Recipient")}</span>
                  {contact.phone ? (
                    <a href={phoneHref(contact.phone)} className="inline-flex items-center gap-1 font-semibold text-ink hover:underline">
                      <Phone size={11} /> {displayPhone(contact.phone)}
                    </a>
                  ) : null}
                </p>
              ) : null}

              {stop.packageName || stop.category || stop.description ? (
                <p className="mt-1 text-xs text-ink-muted">
                  {[stop.packageName, stop.category].filter(Boolean).join(" · ")}
                  {stop.description ? <span className="block text-ink-faint">{stop.description}</span> : null}
                </p>
              ) : null}

              {stop.recipients?.length ? (
                <ul className="mt-2 space-y-1">
                  {stop.recipients.map((recipient, i) => (
                    <li key={recipient._id ?? i} className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <span className="font-semibold text-ink">{recipient.name}</span>
                      {recipient.phone ? <span>{displayPhone(recipient.phone)}</span> : null}
                      <Badge tone={statusTone(recipient.status)}>{STOP_STATUS_LABEL[recipient.status] ?? recipient.status}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}

              {codes.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {codes.map((entry, i) => (
                    <CodeChip key={i} code={entry.code} name={entry.name} status={entry.status} />
                  ))}
                </div>
              ) : null}

              {lastAt ? (
                <p className="mt-1.5 text-[11px] text-ink-faint">
                  {stop.completedAt ? "Done" : stop.cancelledAt ? "Cancelled" : stop.arrivedAt ? "Arrived" : "Started"} {when(lastAt)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
