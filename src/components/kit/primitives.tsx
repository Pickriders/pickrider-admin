"use client";

import Link from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

/** Tiny class joiner; keeps the kit dependency-free. */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ── Surfaces ──────────────────────────────────────────────────────────────────

export function Panel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("rounded-2xl border border-line bg-card shadow-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-3 px-6 pt-5", className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-bold tracking-tight text-ink">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brand text-brand-ink hover:bg-brand-dark shadow-sm",
  secondary: "bg-brand-soft text-brand-dark hover:bg-brand/20",
  outline: "border border-line-strong bg-card text-ink hover:bg-surface",
  ghost: "text-ink-muted hover:bg-surface hover:text-ink",
  danger: "bg-danger text-white hover:brightness-95 shadow-sm",
  success: "bg-success text-white hover:brightness-95 shadow-sm",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  icon: "h-9 w-9 text-sm",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon: Icon, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        "relative inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT[variant],
        SIZE[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={size === "sm" ? 14 : 16} /> : null}
      {children}
    </button>
  );
});

export function LinkButton({
  href,
  variant = "outline",
  size = "md",
  icon: Icon,
  className,
  children,
  external,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  const classes = cx(
    "inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.98]",
    VARIANT[variant],
    SIZE[size],
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {Icon ? <Icon size={size === "sm" ? 14 : 16} /> : null}
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} prefetch>
      {Icon ? <Icon size={size === "sm" ? 14 : 16} /> : null}
      {children}
    </Link>
  );
}

// ── Badges ────────────────────────────────────────────────────────────────────

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const TONE: Record<Tone, string> = {
  neutral: "bg-surface text-ink-muted border-line",
  brand: "bg-brand-soft text-brand-dark border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
};

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4",
        TONE[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/** One place for status colour so every table agrees. */
export function statusTone(status: string | null | undefined): Tone {
  switch (status) {
    case "completed":
    case "delivered":
    case "SUCCESS":
    case "COMPLETED":
    case "APPROVE":
    case "VERIFIED":
    case "approved":
    case "recovered":
    case "online":
      return "success";
    case "cancelled":
    case "failed":
    case "FAILED":
    case "CANCELLED":
    case "SUSPENDED":
    case "BANNED":
    case "REJECTED":
    case "DISAPPROVE":
    case "suspended":
    case "shortfall":
    case "written_off":
      return "danger";
    case "pending_vendor_acceptance":
    case "pending_payment":
    case "pending":
    case "PROCESSING":
    case "INITIATED":
    case "PENDING":
    case "SUBMITTED":
    case "collecting":
    case "searching":
    case "partially_fulfilled":
      return "warning";
    case "preparing":
    case "ready_for_pickup":
    case "picked_up":
    case "out_for_delivery":
    case "ready":
    case "dispatched":
    case "released":
    case "sent":
    case "ON_GOING":
      return "info";
    case "scheduled":
    case "accepted":
    case "ACCEPTED":
    case "ACTIVE":
      return "brand";
    // Core order, location, payment and bid statuses (uppercase on the API).
    case "COMPLETED":
    case "PAID":
      return "success";
    case "CANCELLED":
      return "danger";
    case "INITIATED":
    case "PENDING":
      return "warning";
    case "ON_GOING":
    case "IN_TRANSIT":
    case "ARRIVED":
      return "info";
    case "ACCEPTED":
      return "brand";
    default:
      return "neutral";
  }
}

// ── Form fields ───────────────────────────────────────────────────────────────

const FIELD =
  "h-10 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      {label ? <span className="mb-1.5 block text-xs font-semibold text-ink-muted">{label}</span> : null}
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { left?: ReactNode }>(
  function Input({ className, left, ...props }, ref) {
    if (left) {
      return (
        <span className="relative block">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-faint">{left}</span>
          <input ref={ref} className={cx(FIELD, "pl-9", className)} {...props} />
        </span>
      );
    }
    return <input ref={ref} className={cx(FIELD, className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cx(FIELD, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cx(FIELD, "h-auto min-h-24 py-2", className)} {...props} />;
  },
);

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 disabled:opacity-60"
    >
      <span
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-line-strong",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
      {label ? <span className="text-sm font-medium text-ink">{label}</span> : null}
    </button>
  );
}

// ── Layout helpers ────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {breadcrumb ? <div className="mb-1 text-xs font-medium text-ink-faint">{breadcrumb}</div> : null}
        <h1 className="text-2xl font-black tracking-tight text-ink md:text-[28px]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cx("flex flex-col items-center justify-center text-center", compact ? "py-8" : "py-16")}>
      {Icon ? (
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-surface text-ink-faint">
          <Icon size={22} />
        </span>
      ) : null}
      <p className="text-sm font-bold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-8 text-center">
      <p className="text-sm font-semibold text-danger">{message}</p>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  // A span so it is valid anywhere, including inside <p>; hydration breaks on <div> in <p>.
  return <span className={cx("block animate-pulse rounded-lg bg-line", className)} />;
}

export function Avatar({ src, name, size = 36 }: { src?: string | null; name?: string | null; size?: number }) {
  const letters = (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand-dark"
      style={{ width: size, height: size }}
    >
      {letters || "•"}
    </span>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T;
  onChange: (next: T) => void;
  items: { id: T; label: ReactNode; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cx("admin-scroll -mx-1 flex gap-1 overflow-x-auto px-1", className)} role="tablist">
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(item.id)}
            className={cx(
              "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
              active ? "bg-ink text-card" : "text-ink-muted hover:bg-surface hover:text-ink",
            )}
          >
            {item.label}
            {item.count != null ? (
              <span
                className={cx(
                  "rounded-full px-1.5 text-[11px]",
                  active ? "bg-card/20 text-card" : "bg-line text-ink-muted",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function KeyValue({ items, columns = 2 }: { items: { label: ReactNode; value: ReactNode }[]; columns?: 1 | 2 | 3 | 4 }) {
  const cols = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[columns];
  return (
    <dl className={cx("grid grid-cols-1 gap-x-6 gap-y-3", cols)}>
      {items.map((item, index) => (
        <div key={index} className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{item.label}</dt>
          <dd className="mt-0.5 truncate text-sm font-medium text-ink">{item.value ?? <span className="text-ink-faint">Not set</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
