"use client";

import type { ReactNode } from "react";

import { cx } from "@/components/kit/primitives";

/**
 * A pill toggle for the "Top by" rankings and quick filters above a table. Active chips invert to
 * ink; `warning` marks a filter that surfaces something needing attention (licences to review,
 * paused riders, restricted withdrawals) so it reads amber even while off.
 */
export function Chip({
  active,
  onClick,
  children,
  tone = "neutral",
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: "neutral" | "warning";
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={cx(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-bold transition-colors",
        active
          ? "border-transparent bg-ink text-card"
          : tone === "warning"
            ? "border-transparent bg-warning-soft text-warning hover:brightness-95"
            : "border-line bg-card text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/** The thin divider between the sort chips and the filter chips. */
export function ChipDivider() {
  return <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />;
}
