"use client";

import { AlertTriangle, CircleHelp, ShieldAlert, X, type LucideIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/components/kit/primitives";

/**
 * Side sheet for a quick look at one row without leaving the table. Full-width
 * bottom sheet on phones, right-hand panel from `md`. Portals to body; the
 * theme class lives on <html> so tokens and dark mode carry through.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  // Static class names: Tailwind only generates what it can see in the source,
  // so the width has to be a fixed set rather than a string built at runtime.
  const widthClass = { sm: "md:max-w-md", md: "md:max-w-xl", lg: "md:max-w-3xl" }[width];
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-3xl border border-line bg-card shadow-pop admin-fade-up",
          "md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-full md:rounded-none md:border-l md:border-y-0 md:border-r-0",
          widthClass,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title ? <h2 className="truncate text-base font-black tracking-tight text-ink">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-muted hover:bg-surface hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <div className="admin-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-line px-5 py-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Confirmation dialog on the same visual system as the drawer. Every sensitive
 * action goes through it: an icon and tint say how serious the step is, the
 * description says exactly what happens next, and the primary button names
 * the action rather than saying "OK".
 */
const CONFIRM_TONE: Record<"primary" | "warning" | "danger", { icon: LucideIcon; chip: string; button: string; ring: string }> = {
  primary: { icon: CircleHelp, chip: "bg-brand-soft text-brand-dark", button: "bg-brand text-brand-ink hover:bg-brand-dark", ring: "from-brand/15" },
  warning: { icon: AlertTriangle, chip: "bg-warning-soft text-warning", button: "bg-warning text-white hover:brightness-95", ring: "from-warning/15" },
  danger: { icon: ShieldAlert, chip: "bg-danger-soft text-danger", button: "bg-danger text-white hover:brightness-95", ring: "from-danger/15" },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  icon,
  loading,
  disabled,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  tone?: "primary" | "warning" | "danger";
  /** Overrides the tone's default icon. */
  icon?: LucideIcon;
  loading?: boolean;
  /** Keeps the primary button off until the form inside is complete. */
  disabled?: boolean;
  children?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  if (!open || typeof document === "undefined") return null;
  const look = CONFIRM_TONE[tone];
  const Icon = icon ?? look.icon;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={loading ? undefined : onClose} />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-card shadow-pop admin-fade-up"
      >
        <div className={cx("pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent", look.ring)} />
        <div className="relative px-6 pb-6 pt-6">
          <span className={cx("grid h-12 w-12 place-items-center rounded-2xl", look.chip)}>
            <Icon size={22} />
          </span>
          <h2 className="mt-4 text-lg font-black tracking-tight text-ink">{title}</h2>
          {description ? <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p> : null}
          {children ? <div className="mt-4">{children}</div> : null}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading || disabled}
              className={cx("h-11 rounded-xl px-4 text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-60", look.button)}
            >
              {loading ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
