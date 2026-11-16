"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Paged } from "@/lib/admin/api";
import { downloadCsv, toCsv } from "@/lib/admin/api";
import { useTableState } from "@/lib/admin/url-state";
import { Button, EmptyState, ErrorState, Input, Panel, Select, Skeleton, cx } from "@/components/kit/primitives";
import { DateRangeButton } from "@/components/kit/range-tabs";
import { TableScroll } from "@/components/kit/scroll-row";
import { SkeletonTableRows, type CellSkeleton } from "@/components/kit/skeletons";

/**
 * The one table every admin list uses. Server-paginated, URL-driven, with the
 * previous page kept on screen while the next loads. Under `md` it renders the
 * same rows as cards through `mobileCard`, so nothing needs a second layout.
 */
export type ColumnMeta = {
  /** Server sort key from the endpoint's whitelist; absent means not sortable. */
  sortKey?: string;
  align?: "left" | "right" | "center";
  width?: string;
  /** Column hidden below this breakpoint; the card view shows it instead. */
  hideBelow?: "sm" | "md" | "lg" | "xl" | "2xl";
  csv?: { key: string; label: string; value?: (row: unknown) => unknown };
  /** The cell's loading shape, so skeleton rows are as tall as real ones (default: one line). */
  skeleton?: CellSkeleton;
};

export type FilterSpec = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

export type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[];
  data: Paged<T> | undefined;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  filters?: FilterSpec[];
  searchPlaceholder?: string;
  /** Hide the search box when the endpoint has nothing to search. */
  searchable?: boolean;
  dateFilter?: boolean;
  csvName?: string;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyIcon?: Parameters<typeof EmptyState>[0]["icon"];
  onRowClick?: (row: T) => void;
  rowHref?: (row: T) => string | undefined;
  /** Extra classes for one row (and its phone card), e.g. to highlight the record a link pointed at. */
  rowClassName?: (row: T) => string | undefined;
  mobileCard?: (row: T) => ReactNode;
  /** The card's loading shape on phones; defaults to two plain lines. */
  mobileCardSkeleton?: ReactNode;
  toolbarExtra?: ReactNode;
  defaultSort?: { sortBy: string; order: "ASC" | "DESC" };
  /** Keeps the toolbar in a Panel of its own when the table sits inside another. */
  bare?: boolean;
  liveHint?: ReactNode;
  /** Tighter cells for dense lists (orders); the default suits most tables. */
  density?: "default" | "compact";
  /**
   * Caps the table at the viewport and scrolls inside it, so the header row stays pinned while
   * the rows move. Desktop only; phones use the cards.
   */
  stickyHeader?: boolean;
};

const HIDE: Record<NonNullable<ColumnMeta["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
  "2xl": "hidden 2xl:table-cell",
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  error,
  onRetry,
  filters = [],
  searchPlaceholder = "Search",
  searchable = true,
  dateFilter = true,
  csvName,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyIcon,
  onRowClick,
  rowHref,
  rowClassName,
  mobileCard,
  mobileCardSkeleton,
  toolbarExtra,
  defaultSort,
  bare,
  liveHint,
  density = "default",
  stickyHeader,
}: DataTableProps<T>) {
  const compact = density === "compact";
  const router = useRouter();
  const table = useTableState({ limit: 20, sortBy: defaultSort?.sortBy, order: defaultSort?.order });
  const { state } = table;
  const [search, setSearch] = useState(state.search ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchRef = useRef<number | undefined>(undefined);

  // Debounced search: the URL (and therefore the request) updates after typing
  // pauses, not on every keystroke.
  useEffect(() => {
    if (search === (state.search ?? "")) return;
    window.clearTimeout(searchRef.current);
    searchRef.current = window.setTimeout(() => table.setSearch(search.trim()), 350);
    return () => window.clearTimeout(searchRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setSearch(state.search ?? "");
  }, [state.search]);

  const rows = useMemo(() => data?.items ?? [], [data]);
  const instance = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: data?.totalPages ?? 0,
  });

  const exportCsv = () => {
    if (!csvName || !rows.length) return;
    const specs = columns
      .map((c) => (c.meta as ColumnMeta | undefined)?.csv)
      .filter((c): c is NonNullable<ColumnMeta["csv"]> => Boolean(c));
    const shaped = rows.map((row) =>
      Object.fromEntries(specs.map((s) => [s.key, s.value ? s.value(row) : (row as Record<string, unknown>)[s.key]])),
    );
    downloadCsv(`${csvName}.csv`, toCsv(shaped, specs.map((s) => ({ key: s.key, label: s.label }))));
  };

  const activeFilterEntries = Object.entries(state.filters).filter(([key]) => filters.some((f) => f.key === key));
  const total = data?.total ?? 0;
  const pageStart = total ? (state.page - 1) * state.limit + 1 : 0;
  const pageEnd = Math.min(total, state.page * state.limit);

  // Three rows on a phone (search, then the filter controls with export at the
  // right, then the page's own action at full width); one line on a desktop.
  const hasControls = Boolean(filters.length || dateFilter || table.activeFilterCount);
  const hasExtras = Boolean(liveHint || toolbarExtra || csvName);
  const exportButton = (className: string, label = true) => (
    <Button variant="outline" size="md" icon={Download} onClick={exportCsv} disabled={!rows.length} className={className} aria-label="Export CSV">
      {label ? <span>Export</span> : null}
    </Button>
  );
  const toolbar = (
    <div className="flex flex-col gap-2 px-4 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
      {searchable ? (
        <div className="w-full sm:w-64">
          <Input
            left={<Search size={15} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>
      ) : null}
      {hasControls || csvName ? (
        <div className={cx("flex items-center gap-2", !hasControls && "sm:hidden")}>
          {filters.length ? (
            <Button
              variant={activeFilterEntries.length ? "secondary" : "outline"}
              size="md"
              icon={SlidersHorizontal}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              Filters{activeFilterEntries.length ? ` · ${activeFilterEntries.length}` : ""}
            </Button>
          ) : null}
          {dateFilter ? <DateRangeButton from={state.from} to={state.to} onChange={(from, to) => table.setRange(from, to)} /> : null}
          {table.activeFilterCount ? (
            <Button variant="ghost" size="md" icon={X} onClick={table.clear}>
              Clear
            </Button>
          ) : null}
          {csvName ? exportButton("ml-auto sm:hidden", false) : null}
        </div>
      ) : null}
      {hasExtras ? (
        <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center sm:justify-end [&>*]:w-full sm:[&>*]:w-auto">
          {liveHint}
          {toolbarExtra}
          {csvName ? exportButton("hidden sm:inline-flex") : null}
        </div>
      ) : null}
    </div>
  );

  const filterPanel =
    filtersOpen && filters.length ? (
      <div className="mx-4 mt-3 grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface p-3 sm:grid-cols-2 lg:grid-cols-4 admin-fade-up">
        {filters.map((filter) => (
          <label key={filter.key} className="text-[11px] font-semibold text-ink-muted">
            {filter.label}
            <Select
              className="mt-1"
              value={state.filters[filter.key] ?? ""}
              onChange={(e) => table.setFilter(filter.key, e.target.value || undefined)}
            >
              <option value="">All</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        ))}
      </div>
    ) : null;

  const headerCell = (header: ReturnType<typeof instance.getHeaderGroups>[number]["headers"][number]) => {
    const meta = (header.column.columnDef.meta ?? {}) as ColumnMeta;
    const sortable = Boolean(meta.sortKey);
    const active = sortable && state.sortBy === meta.sortKey;
    return (
      <th
        key={header.id}
        style={{ width: meta.width }}
        className={cx(
          "sticky top-0 z-10 whitespace-nowrap bg-card text-[11px] font-bold uppercase tracking-wide text-ink-faint",
          compact ? "px-3 py-2 first:pl-4 last:pr-4" : "px-4 py-2.5",
          // border-collapse drops a sticky cell's border once it pins; an inset shadow keeps the rule.
          stickyHeader ? "shadow-[inset_0_-1px_0_hsl(var(--border))]" : "border-b border-line",
          meta.align === "right" ? "text-right" : meta.align === "center" ? "text-center" : "text-left",
          meta.hideBelow ? HIDE[meta.hideBelow] : "",
        )}
      >
        {sortable ? (
          <button
            type="button"
            onClick={() => table.setSort(meta.sortKey!)}
            className={cx("inline-flex items-center gap-1 hover:text-ink", active && "text-ink")}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {active ? (state.order === "ASC" ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-50" />}
          </button>
        ) : (
          flexRender(header.column.columnDef.header, header.getContext())
        )}
      </th>
    );
  };

  const bodyRow = (row: Row<T>) => {
    const href = rowHref?.(row.original);
    const clickable = Boolean(onRowClick || href);
    return (
      <tr
        key={row.id}
        onClick={() => {
          if (onRowClick) onRowClick(row.original);
          else if (href) router.push(href);
        }}
        className={cx("border-b border-line last:border-0 transition-colors", clickable && "cursor-pointer hover:bg-surface/80", rowClassName?.(row.original))}
      >
        {row.getVisibleCells().map((cell) => {
          const meta = (cell.column.columnDef.meta ?? {}) as ColumnMeta;
          return (
            <td
              key={cell.id}
              className={cx(
                "align-middle text-sm text-ink",
                compact ? "px-3 py-2.5 first:pl-4 last:pr-4" : "px-4 py-3",
                meta.align === "right" ? "text-right" : meta.align === "center" ? "text-center" : "text-left",
                meta.hideBelow ? HIDE[meta.hideBelow] : "",
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
      </tr>
    );
  };

  const skeletonRows = Array.from({ length: Math.min(state.limit, 8) });
  // Same widths, alignment and breakpoints as the real cells, so the first page lands in place.
  const skeletonColumns = instance.getVisibleLeafColumns().map((column) => (column.columnDef.meta ?? {}) as ColumnMeta);

  const body = (
    <>
      {toolbar}
      {filterPanel}
      {error ? (
        <div className="p-4">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      ) : !loading && !rows.length ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          {/* Cards under md when a card renderer is supplied */}
          {mobileCard ? (
            <div className="mt-3 divide-y divide-line md:hidden">
              {loading && !rows.length
                ? skeletonRows.map((_, i) =>
                    mobileCardSkeleton ? (
                      <div key={i} className="px-4 py-3" aria-hidden>
                        {mobileCardSkeleton}
                      </div>
                    ) : (
                      <div key={i} className="space-y-2 px-4 py-3">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ),
                  )
                : rows.map((row, index) => {
                    const href = rowHref?.(row);
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (onRowClick) onRowClick(row);
                          else if (href) router.push(href);
                        }}
                        className={cx("px-4 py-3", (onRowClick || href) && "cursor-pointer active:bg-surface", rowClassName?.(row))}
                      >
                        {mobileCard(row)}
                      </div>
                    );
                  })}
            </div>
          ) : null}
          {/* Only the scroller is wrapped: the sticky header and vertical scroll are untouched, the
              edges fade when columns are hidden sideways, and the arrows sit by the header row. */}
          <TableScroll
            className={cx("mt-3", mobileCard && "hidden md:block")}
            innerClassName={cx(
              stickyHeader && "md:max-h-[calc(100dvh-14rem)] md:overflow-y-auto md:overscroll-y-contain",
            )}
            arrowTop={compact ? "16px" : "19px"}
          >
            <table className="w-full border-collapse">
              <thead>
                {instance.getHeaderGroups().map((group) => (
                  <tr key={group.id}>{group.headers.map(headerCell)}</tr>
                ))}
              </thead>
              <tbody className={cx(loading && rows.length ? "opacity-60 transition-opacity" : "")}>
                {loading && !rows.length ? (
                  <SkeletonTableRows columns={skeletonColumns} rows={skeletonRows.length} compact={compact} />
                ) : (
                  instance.getRowModel().rows.map(bodyRow)
                )}
              </tbody>
            </table>
          </TableScroll>
        </>
      )}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-ink-muted sm:flex-row">
        <div className="flex items-center gap-3">
          <span>
            {total ? (
              <>
                Showing <span className="font-semibold text-ink">{pageStart}</span> to{" "}
                <span className="font-semibold text-ink">{pageEnd}</span> of{" "}
                <span className="font-semibold text-ink">{total.toLocaleString()}</span>
              </>
            ) : loading ? (
              "Loading"
            ) : (
              "No results"
            )}
          </span>
          <label className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Rows</span>
            <Select
              value={String(state.limit)}
              onChange={(e) => table.update({ limit: e.target.value === "20" ? undefined : e.target.value })}
              className="h-8 w-[74px] px-2 text-xs"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <Pager page={state.page} totalPages={data?.totalPages ?? 1} onPage={table.setPage} />
      </div>
    </>
  );

  return bare ? <div>{body}</div> : <Panel className="overflow-hidden">{body}</Panel>;
}

export function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  const pages = useMemo(() => {
    const items: (number | "…")[] = [];
    const add = (n: number) => items.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
      return items;
    }
    add(1);
    if (page > 3) items.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
    if (page < totalPages - 2) items.push("…");
    add(totalPages);
    return items;
  }, [page, totalPages]);

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft size={16} />
      </Button>
      {pages.map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-faint">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPage(item)}
            className={cx(
              "h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition-colors",
              item === page ? "bg-ink text-card" : "text-ink-muted hover:bg-surface hover:text-ink",
            )}
          >
            {item}
          </button>
        ),
      )}
      <Button variant="ghost" size="icon" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
