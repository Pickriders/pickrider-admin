"use client";

import type { CSSProperties, ReactNode } from "react";

import { Panel, Skeleton, cx } from "@/components/kit/primitives";

/**
 * Loading shapes that mirror the real layouts, so nothing jumps when data arrives: every bar sits
 * in a box the height of the line it stands in for, cells keep their table's padding, widths and
 * breakpoints, and chip rows and tab bars keep their pill sizes.
 */

/** What a column's cells look like, so its skeleton has the same height and shape. */
export type CellSkeleton =
  | "line"
  | "lines"
  | "order"
  | "stat"
  | "person"
  | "profile"
  | "badge"
  | "pill"
  | "button"
  | "none";

export const HIDE_BELOW = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
  "2xl": "hidden 2xl:table-cell",
} as const;

/** A bar centred in a box of the real line's height. */
export function SkeletonLine({ box = "h-5", bar, className }: { box?: string; bar: string; className?: string }) {
  return (
    <span className={cx("flex items-center", box, className)}>
      <Skeleton className={bar} />
    </span>
  );
}

/** Two stacked lines, 13px over 11px at leading-tight: an order number and its type, a date and "2h ago". */
type Align = "left" | "right" | "center";

export function SkeletonLines({
  align = "left",
  first = "w-24",
  second = "w-16",
}: {
  align?: Align;
  first?: string;
  second?: string;
}) {
  const justify = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "";
  return (
    <span className="block">
      <SkeletonLine box={cx("h-4", justify)} bar={cx("h-3 max-w-full", first)} />
      <SkeletonLine box={cx("mt-1 h-3.5", justify)} bar={cx("h-2.5 max-w-full", second)} />
    </span>
  );
}

/** The orders OrderCell: number, then the small source pill and the type on the 11px line. */
export function SkeletonOrder({ number = "w-24", type = "w-12" }: { number?: string; type?: string }) {
  return (
    <span className="block">
      <SkeletonLine box="h-4" bar={cx("h-3 max-w-full", number)} />
      <span className="mt-1 flex h-3.5 items-center gap-1.5">
        <Skeleton className="h-3.5 w-10 shrink-0 rounded" />
        <Skeleton className={cx("h-2.5", type)} />
      </span>
    </span>
  );
}

/** Avatar plus name and phone, the PartyCell shape. */
export function SkeletonPerson({ size = 28, name = "w-28" }: { size?: number; name?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="shrink-0 animate-pulse rounded-full bg-line" style={{ width: size, height: size }} />
      <span className="min-w-0 flex-1">
        <SkeletonLine box="h-4" bar={cx("h-3 max-w-full", name)} />
        <SkeletonLine box="mt-0.5 h-3.5" bar="h-2.5 w-20 max-w-full" />
      </span>
    </span>
  );
}

/** A status pill with its timestamp underneath, the StatusWithTime shape. */
export function SkeletonBadge({ align = "left", withLine = true }: { align?: Align; withLine?: boolean }) {
  const items = align === "right" ? "items-end" : align === "center" ? "items-center" : "items-start";
  return (
    <span className={cx("flex flex-col gap-1", items)}>
      <Skeleton className="h-[22px] w-24 rounded-full" />
      {withLine ? <SkeletonLine box="h-3.5" bar="h-2.5 w-20" /> : null}
    </span>
  );
}

/** A 36px avatar with a text-sm name over a text-xs line: the customer and rider list cells. */
export function SkeletonProfile({ size = 36, name = "w-32" }: { size?: number; name?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="shrink-0 animate-pulse rounded-full bg-line" style={{ width: size, height: size }} />
      <span className="min-w-0 flex-1">
        <SkeletonLine box="h-5" bar={cx("h-3.5 max-w-full", name)} />
        <SkeletonLine box="h-4" bar="h-2.5 w-28 max-w-full" />
      </span>
    </span>
  );
}

/**
 * The customer and rider phone card: 40px avatar, name with a status pill at the right, the phone
 * line and the totals line.
 */
export function ProfileCardSkeleton() {
  return (
    <div className="flex items-start gap-3" aria-hidden>
      <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-line" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <SkeletonLine box="h-6" bar="h-3.5 w-36 max-w-full" />
          <Skeleton className="h-[22px] w-16 shrink-0 rounded-full" />
        </div>
        <SkeletonLine box="h-4" bar="h-2.5 w-28" />
        <SkeletonLine box="mt-1 h-4" bar="h-2.5 w-52 max-w-full" />
      </div>
    </div>
  );
}

export function SkeletonCell({ kind = "line", align = "left" }: { kind?: CellSkeleton; align?: Align }) {
  switch (kind) {
    case "none":
      return null;
    case "lines":
      return <SkeletonLines align={align} />;
    case "order":
      return <SkeletonOrder />;
    case "stat": {
      const justify = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "";
      return (
        <span className="block">
          <SkeletonLine box={cx("h-5", justify)} bar="h-3.5 w-12" />
          <SkeletonLine box={cx("h-4", justify)} bar="h-2.5 w-14" />
        </span>
      );
    }
    case "profile":
      return <SkeletonProfile />;
    case "pill":
      return <SkeletonBadge align={align} withLine={false} />;
    case "person":
      return <SkeletonPerson />;
    case "badge":
      return <SkeletonBadge align={align} />;
    case "button":
      return (
        <span className={cx("flex", align === "right" ? "justify-end" : align === "center" ? "justify-center" : "")}>
          <Skeleton className="h-8 w-28 rounded-xl" />
        </span>
      );
    default:
      return (
        <SkeletonLine
          box={cx("h-5", align === "right" ? "justify-end" : align === "center" ? "justify-center" : "")}
          bar="h-3.5 w-full max-w-[140px]"
        />
      );
  }
}

/** The column facts a skeleton row needs; DataTable reads them off each column's meta. */
export type SkeletonColumn = {
  skeleton?: CellSkeleton;
  align?: Align;
  width?: string;
  hideBelow?: keyof typeof HIDE_BELOW;
};

/** Placeholder rows for a table body, cell for cell with the real rows. */
export function SkeletonTableRows({
  columns,
  rows,
  compact,
}: {
  columns: SkeletonColumn[];
  rows: number;
  compact?: boolean;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-line last:border-0" aria-hidden>
          {columns.map((column, j) => (
            <td
              key={j}
              style={column.width ? ({ width: column.width } as CSSProperties) : undefined}
              className={cx(
                "align-middle",
                compact ? "px-3 py-2.5 first:pl-4 last:pr-4" : "px-4 py-3",
                column.hideBelow ? HIDE_BELOW[column.hideBelow] : "",
              )}
            >
              <SkeletonCell kind={column.skeleton} align={column.align} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** The pill tab bar (`Tabs`) while a page waits for its search params. */
export function TabsSkeleton({ widths, className }: { widths: string[]; className?: string }) {
  return (
    <div className={cx("flex gap-1 overflow-hidden", className)} aria-hidden>
      {widths.map((width, i) => (
        <Skeleton key={i} className={cx("h-9 shrink-0 rounded-xl", width, i === 0 ? "" : "opacity-60")} />
      ))}
    </div>
  );
}

/**
 * The "Sort" + "Quick filters" menus on phones and the "Top by" chip row from md, at their real
 * sizes (h-10 menus, h-8 chips), for a list page that has not rendered yet.
 */
export function ChipBarSkeleton({ chips, filters }: { chips: string[]; filters: string[] }) {
  return (
    <div aria-hidden>
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <SkeletonLine box="mr-1 h-4" bar="h-2.5 w-12" />
        {chips.map((width, i) => (
          <Skeleton key={`c${i}`} className={cx("h-8 shrink-0 rounded-full", width)} />
        ))}
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        {filters.map((width, i) => (
          <Skeleton key={`f${i}`} className={cx("h-8 shrink-0 rounded-full", width)} />
        ))}
      </div>
    </div>
  );
}

/**
 * A whole DataTable before it mounts (a Suspense fallback): toolbar, header row, skeleton rows or
 * cards, and the footer, in the same Panel with the same paddings.
 */
export function DataTableSkeleton({
  columns,
  rows = 8,
  compact,
  mobileCard,
  extraButton = true,
}: {
  columns: (SkeletonColumn & { header?: ReactNode })[];
  rows?: number;
  compact?: boolean;
  /** The page's card skeleton for phones; without one the table shows at every width. */
  mobileCard?: ReactNode;
  /** Room for the page's own toolbar action ("Message riders"). */
  extraButton?: boolean;
}) {
  return (
    <Panel className="overflow-hidden" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2 px-4 pt-4 sm:flex-row sm:flex-wrap sm:items-center" aria-hidden>
        <Skeleton className="h-10 w-full rounded-xl sm:w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="ml-auto h-10 w-10 rounded-xl sm:hidden" />
        </div>
        <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center">
          {extraButton ? <Skeleton className="h-10 w-full rounded-xl sm:w-44" /> : null}
          <Skeleton className="hidden h-10 w-24 rounded-xl sm:block" />
        </div>
      </div>
      {mobileCard ? (
        <div className="mt-3 divide-y divide-line md:hidden" aria-hidden>
          {Array.from({ length: Math.min(rows, 6) }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              {mobileCard}
            </div>
          ))}
        </div>
      ) : null}
      <div className={cx("mt-3 overflow-hidden", mobileCard ? "hidden md:block" : "")}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column, i) => (
                <th
                  key={i}
                  style={column.width ? { width: column.width } : undefined}
                  className={cx(
                    "whitespace-nowrap border-b border-line bg-card text-[11px] font-bold uppercase tracking-wide",
                    "text-ink-faint",
                    compact ? "px-3 py-2 first:pl-4 last:pr-4" : "px-4 py-2.5",
                    column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left",
                    column.hideBelow ? HIDE_BELOW[column.hideBelow] : "",
                  )}
                >
                  {column.header ?? " "}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SkeletonTableRows columns={columns} rows={rows} compact={compact} />
          </tbody>
        </table>
      </div>
      <div
        className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row"
        aria-hidden
      >
        <div className="flex items-center gap-3">
          <SkeletonLine box="h-4" bar="h-3 w-36" />
          <Skeleton className="h-8 w-[74px] rounded-lg sm:w-[110px]" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </Panel>
  );
}
