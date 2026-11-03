"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const FADE = 28;

// Local joiner: primitives imports this file for Tabs, so this one does not import back.
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
const DEFAULT_ACTIVE = '[aria-pressed="true"], [aria-selected="true"], [aria-current="page"]';

/** Fade only the edge (or edges) that has more content behind it. */
export function edgeMask(edges: { left: boolean; right: boolean }): string | undefined {
  if (!edges.left && !edges.right) return undefined;
  const start = edges.left ? "transparent" : "#000";
  const end = edges.right ? "transparent" : "#000";
  return `linear-gradient(to right, ${start} 0, #000 ${edges.left ? FADE : 0}px, #000 calc(100% - ${
    edges.right ? FADE : 0
  }px), ${end} 100%)`;
}

/**
 * A row that scrolls sideways when it does not fit (tab bars, filter chips, wide tables), and
 * says so: the edge with more behind it fades out, and a small round arrow on that edge pages
 * along. With `peekKey`, the first overflow in a visit nudges the row and back so the swipe is
 * discovered without a label. `activeKey` keeps the selected item in view when it changes.
 * Nothing shows when the content fits.
 */
export function ScrollRow({
  children,
  className,
  innerClassName,
  innerStyle,
  label,
  peekKey,
  activeSelector = DEFAULT_ACTIVE,
  activeKey,
  arrowTop,
  arrowInset = false,
  hideScrollbar = true,
}: {
  children: ReactNode;
  /** Classes for the outer box (spacing, responsive visibility). */
  className?: string;
  /** Classes for the scrolling element. */
  innerClassName?: string;
  innerStyle?: CSSProperties;
  label?: string;
  /** Peeks once per visit for this key; omit to never peek. */
  peekKey?: string;
  /** Empty string turns off keeping an active item in view (tables with toggles in rows). */
  activeSelector?: string;
  activeKey?: string;
  /** CSS `top` for the arrow centres; defaults to the middle of the row. */
  arrowTop?: string;
  /** Keep the arrows inside the box, for parents that clip their overflow. */
  arrowInset?: boolean;
  /** Hide the native scrollbar (chip rows); keep it for wide tables. */
  hideScrollbar?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = { left: el.scrollLeft > 2, right: el.scrollLeft < max - 2 };
    setEdges((prev) => (prev.left === next.left && prev.right === next.right ? prev : next));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    if (el.firstElementChild) observer?.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [measure]);

  // Keep the selected item in view, without moving the page up or down.
  useEffect(() => {
    const el = ref.current;
    if (!el || !activeSelector) return;
    const active = el.querySelector<HTMLElement>(activeSelector);
    if (!active) return;
    const left = active.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
    const right = left + active.offsetWidth;
    if (left < el.scrollLeft + FADE) el.scrollTo({ left: Math.max(0, left - FADE), behavior: "smooth" });
    else if (right > el.scrollLeft + el.clientWidth - FADE) {
      el.scrollTo({ left: right - el.clientWidth + FADE, behavior: "smooth" });
    }
  }, [activeKey, activeSelector]);

  // One peek per visit, so people learn the row scrolls.
  useEffect(() => {
    const el = ref.current;
    if (!el || !peekKey) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const storageKey = `pickriders_admin_scroll_peek:${peekKey}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
    } catch {
      return;
    }
    let back: number | undefined;
    const timer = window.setTimeout(() => {
      if (el.scrollWidth - el.clientWidth < 8 || el.scrollLeft > 0) return;
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        /* private mode */
      }
      el.scrollTo({ left: 48, behavior: "smooth" });
      back = window.setTimeout(() => el.scrollTo({ left: 0, behavior: "smooth" }), 520);
    }, 700);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(back);
    };
  }, [peekKey]);

  const page = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(120, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const mask = edgeMask(edges);
  const arrow = cx(
    "absolute z-[1] grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-card text-ink-muted",
    "shadow-[0_2px_8px_rgba(0,0,0,0.22)] ring-1 ring-line-strong transition hover:text-ink active:scale-90",
    !arrowTop && "top-1/2",
  );
  const arrowStyle = arrowTop ? { top: arrowTop } : undefined;

  return (
    <div className={cx("relative min-w-0 max-w-full", className)}>
      <div
        ref={ref}
        role={label ? "group" : undefined}
        aria-label={label}
        className={cx(
          "overflow-x-auto",
          hideScrollbar ? "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "admin-scroll",
          innerClassName,
        )}
        style={mask ? { ...innerStyle, maskImage: mask, WebkitMaskImage: mask } : innerStyle}
      >
        {children}
      </div>
      {edges.left ? (
        <button
          type="button"
          onClick={() => page(-1)}
          aria-label="Scroll left"
          className={cx(arrow, arrowInset ? "left-1.5" : "-left-1")}
          style={arrowStyle}
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
        </button>
      ) : null}
      {edges.right ? (
        <button
          type="button"
          onClick={() => page(1)}
          aria-label="Scroll right"
          className={cx(arrow, arrowInset ? "right-1.5" : "-right-1")}
          style={arrowStyle}
        >
          <ChevronRight size={15} strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
}

/**
 * The sideways scroller for a wide table or grid. Only the horizontal box is wrapped, so sticky
 * headers and vertical scrolling behave as before; the arrows sit by the header row, inside the
 * box, clear of row actions.
 */
export function TableScroll({
  children,
  className,
  innerClassName,
  arrowTop = "19px",
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Arrow centre from the top; defaults to the middle of a standard header row. */
  arrowTop?: string;
}) {
  return (
    <ScrollRow
      className={className}
      innerClassName={innerClassName}
      arrowTop={arrowTop}
      arrowInset
      activeSelector=""
      hideScrollbar={false}
    >
      {children}
    </ScrollRow>
  );
}
