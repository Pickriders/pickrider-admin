"use client";

import { X } from "lucide-react";
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

/** Confirmation dialog on the same visual system as the drawer. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "primary",
  loading,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  tone?: "primary" | "danger";
  loading?: boolean;
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

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={loading ? undefined : onClose} />
      <div role="alertdialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl border border-line bg-card p-5 shadow-pop admin-fade-up">
        <h2 className="text-base font-black tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-ink-muted">{description}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-xl px-4 text-sm font-semibold text-ink-muted hover:bg-surface hover:text-ink disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cx(
              "h-10 rounded-xl px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-60",
              tone === "danger" ? "bg-danger" : "bg-brand text-brand-ink",
            )}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
