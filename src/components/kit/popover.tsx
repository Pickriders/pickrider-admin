"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

import { useMediaQuery } from "@/components/kit/menu";
import { cx } from "@/components/kit/primitives";

/**
 * A small panel that opens from a toolbar control (the date pickers). One shared behaviour:
 *
 * - Phones (under `sm`): a bottom sheet portalled to <body>, full width, with a backdrop and
 *   safe-area padding. Closes on the backdrop, the X and Escape; locks the page behind it.
 * - From `sm`: the panel hangs under the anchor, on the side `align` asks for, and flips to the
 *   other edge when that side would run off the viewport.
 *
 * The anchor is the `relative` wrapper around the trigger; render the Popover inside it.
 */
export type PopoverSide = "start" | "end";

/** Under this width a dropdown is a bottom sheet (Tailwind's `sm` is 640px). */
export const PHONE_QUERY = "(max-width: 639px)";
const EDGE = 8;

export function isPhoneViewport(width: number) {
  return width < 640;
}

/**
 * Which edge of the anchor the panel should hang from so it stays inside the viewport.
 * `start` lines the panel's left edge up with the anchor's left (CSS `left-0`); `end` lines its
 * right edge up with the anchor's right (`right-0`). The preferred side wins when it fits; the
 * panel flips when it would run off screen; when neither fits it keeps the preferred side and
 * the width clamp (`calc(100vw - 2rem)`) does the rest.
 */
export function popoverSide({
  preferred = "start",
  anchorLeft,
  anchorRight,
  panelWidth,
  viewportWidth,
  edge = EDGE,
}: {
  preferred?: PopoverSide;
  anchorLeft: number;
  anchorRight: number;
  panelWidth: number;
  viewportWidth: number;
  edge?: number;
}): PopoverSide {
  const fitsStart = anchorLeft + panelWidth + edge <= viewportWidth;
  const fitsEnd = anchorRight - panelWidth - edge >= 0;
  if (preferred === "start") return fitsStart || !fitsEnd ? "start" : "end";
  return fitsEnd || !fitsStart ? "end" : "start";
}

export function Popover({
  open,
  onClose,
  anchorRef,
  align = "start",
  title,
  label,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  /** The `relative` wrapper holding the trigger; outside presses are measured against it. */
  anchorRef: RefObject<HTMLElement>;
  /** Preferred edge on desktop. */
  align?: PopoverSide;
  /** Heading on the sheet and the panel; also the dialog's accessible name. */
  title?: ReactNode;
  /** Accessible name when `title` is not a string. */
  label?: string;
  children: ReactNode;
  /** Extra classes for the desktop panel (e.g. a wider width). */
  className?: string;
}) {
  const phone = useMediaQuery(PHONE_QUERY);
  const panelRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<PopoverSide>(align);

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const rect = anchor.getBoundingClientRect();
    setSide(
      popoverSide({
        preferred: align,
        anchorLeft: rect.left,
        anchorRight: rect.right,
        panelWidth: panel.offsetWidth,
        viewportWidth: window.innerWidth,
      }),
    );
  }, [align, anchorRef]);

  // Pick the side before paint, then follow the window.
  useLayoutEffect(() => {
    if (!open || phone) return;
    place();
  }, [open, phone, place]);

  useEffect(() => {
    if (!open || phone) return;
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, phone, place]);

  // Escape closes both shapes.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Outside press closes. The anchor is excluded so its trigger can toggle.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose, anchorRef]);

  // The sheet locks the page behind it, like the drawer and the menus.
  useEffect(() => {
    if (!open || !phone) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, phone]);

  if (!open) return null;

  const name = label ?? (typeof title === "string" ? title : undefined);

  if (phone && typeof document !== "undefined") {
    return createPortal(
      <div className="fixed inset-0 z-[55]" data-popover="sheet">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] admin-fade-in"
          onClick={onClose}
          aria-hidden
          data-popover-backdrop
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={name}
          className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl border border-line bg-card pb-[env(safe-area-inset-bottom)] shadow-pop admin-fade-up"
        >
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong" aria-hidden />
          <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-2">
            <p className="text-sm font-black tracking-tight text-ink">{title}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
          <div className="admin-scroll overflow-y-auto overscroll-contain px-4 pb-4 pt-1">{children}</div>
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={name}
      data-popover="anchored"
      data-side={side}
      className={cx(
        "absolute z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-line bg-card-raised p-4 shadow-pop admin-fade-up",
        side === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {title ? (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold text-ink">{title}</p>
          <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            <X size={14} />
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
}
