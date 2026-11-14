"use client";

import { Building2, Check, ChevronRight, Copy, Landmark, Mail, Phone, UserRoundX, UsersRound } from "lucide-react";
import Link from "next/link";
import { useState, type MouseEvent } from "react";

import { Avatar, Badge, cx, statusTone, type Tone } from "@/components/kit";
import type { TransactionOwner, TransactionOwnerKind } from "@/lib/admin/api";
import { formatEmail, statusLabel } from "@/lib/admin/format";
import { ownerName } from "@/lib/admin/person";

import { phoneLabel } from "./user-actions";

/**
 * Who a wallet row belongs to, as the API resolves it (`owner` / `rider` on admin transactions).
 * The whole card links to the right profile for the kind; the copy button sits above that link
 * so copying a phone number never navigates away.
 */
export const OWNER_KIND_LABEL: Record<TransactionOwnerKind, string> = {
  CUSTOMER: "Customer",
  RIDER: "Rider",
  BUSINESS: "Business",
  PLATFORM: "Platform",
  TEAM: "Team",
};

const KIND_TONE: Record<TransactionOwnerKind, Tone> = {
  CUSTOMER: "brand",
  RIDER: "info",
  BUSINESS: "neutral",
  PLATFORM: "success",
  TEAM: "neutral",
};

/**
 * The profile page for a wallet owner. The platform wallet and teams have no profile page, and an
 * account that no longer exists has nowhere to go.
 */
export function ownerHref(owner: Pick<TransactionOwner, "kind" | "id" | "missing"> | null | undefined): string | undefined {
  if (!owner || owner.missing || !owner.id) return undefined;
  switch (owner.kind) {
    case "CUSTOMER":
      return `/customers/${owner.id}`;
    case "RIDER":
      return `/couriers/${owner.id}/details`;
    case "BUSINESS":
      return `/business/${owner.id}/business-details`;
    default:
      return undefined;
  }
}

function KindAvatar({ person, size }: { person: TransactionOwner; size: number }) {
  if (person.missing) {
    return (
      <span className="grid shrink-0 place-items-center rounded-full bg-surface text-ink-faint" style={{ width: size, height: size }}>
        <UserRoundX size={Math.round(size * 0.45)} />
      </span>
    );
  }
  if (!person.photo && person.kind !== "CUSTOMER" && person.kind !== "RIDER") {
    const Icon = person.kind === "PLATFORM" ? Landmark : person.kind === "TEAM" ? UsersRound : Building2;
    return (
      <span
        className={cx("grid shrink-0 place-items-center rounded-xl", person.kind === "PLATFORM" ? "bg-success-soft text-success" : "bg-surface text-ink-muted")}
        style={{ width: size, height: size }}
      >
        <Icon size={Math.round(size * 0.45)} />
      </span>
    );
  }
  return (
    <span className="relative shrink-0">
      <Avatar src={person.photo} name={ownerName(person)} size={size} />
      {person.kind === "RIDER" && person.isOnline !== undefined ? (
        <span
          className={cx("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card", person.isOnline ? "bg-success" : "bg-line-strong")}
          aria-label={person.isOnline ? "Online" : "Offline"}
          title={person.isOnline ? "Online now" : "Offline"}
        />
      ) : null}
    </span>
  );
}

/** Writes to the clipboard, falling back to a hidden textarea where the async API is missing (plain http). */
async function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  if (!ok) throw new Error("copy failed");
}

/**
 * Copies `text` without letting the click reach a surrounding link or row. `inline` adds a small
 * "Copied" label next to the tick; either way screen readers hear "Copied".
 */
export function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  inline = false,
}: {
  text: string;
  label?: string;
  size?: "sm" | "md";
  inline?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    copyText(text)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => undefined);
  };
  const md = size === "md";
  return (
    <span className="relative z-10 inline-flex shrink-0 items-center">
      <button
        type="button"
        onClick={copy}
        title={copied ? "Copied" : label}
        aria-label={label}
        className={cx(
          "grid shrink-0 place-items-center rounded-md text-ink-faint transition-colors hover:bg-card hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
          md ? "h-7 w-7 hover:bg-surface" : "h-6 w-6",
        )}
      >
        {copied ? <Check size={md ? 14 : 12} className="text-success" /> : <Copy size={md ? 13 : 12} />}
      </button>
      {inline ? (
        <span
          aria-hidden
          className={cx(
            "pointer-events-none whitespace-nowrap text-[11px] font-bold text-success transition-opacity duration-150",
            copied ? "opacity-100" : "w-0 overflow-hidden opacity-0",
          )}
        >
          Copied
        </span>
      ) : null}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </span>
  );
}

/**
 * A wallet owner (or the rider behind a row) as a card. `md` for the top of a drawer, `sm` for a
 * secondary party such as the rider behind a business earning.
 */
export function PersonCard({
  person,
  label,
  size = "md",
  className,
}: {
  person: TransactionOwner | null | undefined;
  /** Small caption above the card, e.g. "Wallet owner" or "Rider". */
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!person) return null;
  const href = ownerHref(person);
  const small = size === "sm";
  const avatarSize = small ? 34 : 46;
  const showStatus = Boolean(person.status) && !person.missing && person.kind !== "PLATFORM";

  if (person.missing) {
    return (
      <div className={cx("rounded-2xl border border-dashed border-line bg-surface/60", small ? "p-3" : "p-4", className)}>
        {label ? <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-faint">{label}</p> : null}
        <div className="flex items-center gap-3 opacity-70">
          <KindAvatar person={person} size={avatarSize} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink-muted">Account no longer exists</p>
            <p className="truncate text-xs text-ink-faint">
              {OWNER_KIND_LABEL[person.kind]} wallet · <span className="font-mono">{person.id}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "group relative rounded-2xl border border-line bg-card transition-colors",
        href && "hover:border-line-strong hover:bg-surface",
        small ? "p-3" : "p-4",
        className,
      )}
    >
      {href ? (
        <Link
          href={href}
          prefetch={false}
          className="absolute inset-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label={`View ${ownerName(person)}'s profile`}
        />
      ) : null}
      {label || href ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">{label}</p>
          {href ? (
            <span className="pointer-events-none inline-flex items-center gap-0.5 text-[11px] font-bold text-brand-dark group-hover:underline">
              View profile <ChevronRight size={12} />
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="pointer-events-none flex items-center gap-3">
        <KindAvatar person={person} size={avatarSize} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className={cx("max-w-full truncate font-bold text-ink", small ? "text-sm" : "text-base tracking-tight")}>{ownerName(person)}</p>
            <Badge tone={KIND_TONE[person.kind]}>{OWNER_KIND_LABEL[person.kind]}</Badge>
            {showStatus ? (
              <Badge tone={statusTone(person.status)} dot>
                {statusLabel(person.status)}
              </Badge>
            ) : null}
            {person.kind === "RIDER" && person.isOnline ? <span className="text-[11px] font-semibold text-success">Online</span> : null}
          </div>
          {person.kind === "PLATFORM" ? (
            <p className="mt-0.5 text-xs text-ink-muted">The platform&apos;s own wallet: charges, commissions and payouts.</p>
          ) : null}
          {person.phone ? (
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-ink-muted">
              <Phone size={12} className="shrink-0" />
              <span className="truncate tabular-nums">{phoneLabel(person.phone)}</span>
              <span className="pointer-events-auto">
                <CopyButton text={phoneLabel(person.phone)} label="Copy phone number" />
              </span>
            </p>
          ) : null}
          {person.email && !small ? (
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-ink-faint">
              <Mail size={12} className="shrink-0" />
              <span className="truncate">{formatEmail(person.email)}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** The owner in a table cell: avatar, name and kind, linked to the profile when there is one. */
export function PersonInline({ person, fallback = "Wallet" }: { person: TransactionOwner | null | undefined; fallback?: string }) {
  if (!person) return <span className="text-sm text-ink-muted">{fallback}</span>;
  const href = ownerHref(person);
  const body = (
    <span className={cx("flex min-w-0 items-center gap-2", person.missing && "opacity-60")}>
      <KindAvatar person={person} size={28} />
      <span className="min-w-0">
        <span className={cx("block truncate text-sm font-semibold", person.missing ? "text-ink-muted" : "text-ink group-hover:text-brand-dark")}>
          {person.missing ? "Account removed" : ownerName(person)}
        </span>
        <span className="block truncate text-[11px] text-ink-faint">{OWNER_KIND_LABEL[person.kind]}</span>
      </span>
    </span>
  );
  if (!href) return body;
  return (
    <Link href={href} prefetch={false} onClick={(e) => e.stopPropagation()} className="group block min-w-0 max-w-[220px]">
      {body}
    </Link>
  );
}
