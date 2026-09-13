"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * The URL is the table's state: page, sort, search, filters and date range
 * all live in the query string so a view can be shared and the back button
 * works. Param names match what the core API reads (page, limit, order, sortBy).
 */
export type TableState = {
  page: number;
  limit: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
  search?: string;
  from?: string;
  to?: string;
  filters: Record<string, string>;
};

const RESERVED = new Set(["page", "limit", "sortBy", "order", "search", "from", "to", "tab"]);

export function useTableState(defaults: { limit?: number; sortBy?: string; order?: "ASC" | "DESC" } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const state = useMemo<TableState>(() => {
    const filters: Record<string, string> = {};
    params.forEach((value, key) => {
      if (!RESERVED.has(key) && value) filters[key] = value;
    });
    const order = params.get("order");
    return {
      page: Math.max(1, Number(params.get("page")) || 1),
      limit: Math.max(1, Number(params.get("limit")) || defaults.limit || 20),
      sortBy: params.get("sortBy") || defaults.sortBy,
      order: order === "ASC" || order === "DESC" ? order : defaults.order,
      search: params.get("search") || undefined,
      from: params.get("from") || undefined,
      to: params.get("to") || undefined,
      filters,
    };
  }, [params, defaults.limit, defaults.sortBy, defaults.order]);

  const update = useCallback(
    (patch: Record<string, string | number | undefined | null>, options: { resetPage?: boolean } = {}) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      if (options.resetPage !== false && !("page" in patch)) next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const setPage = useCallback((page: number) => update({ page: page > 1 ? page : undefined }, { resetPage: false }), [update]);
  const setSort = useCallback(
    (sortBy: string) => {
      const flip = state.sortBy === sortBy && state.order === "DESC" ? "ASC" : "DESC";
      update({ sortBy, order: flip });
    },
    [state.sortBy, state.order, update],
  );
  const setSearch = useCallback((search: string) => update({ search: search || undefined }), [update]);
  const setRange = useCallback((from?: string, to?: string) => update({ from, to }), [update]);
  const setFilter = useCallback((key: string, value?: string) => update({ [key]: value }), [update]);
  const clear = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  /** Flat query for the API, using the core API's param names. */
  const query = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      sortBy: state.sortBy,
      order: state.order,
      dateRange: state.from || state.to ? [state.from ?? "", state.to ?? ""].filter(Boolean).join(",") : undefined,
      ...state.filters,
    }),
    [state],
  );

  const activeFilterCount = Object.keys(state.filters).length + (state.search ? 1 : 0) + (state.from || state.to ? 1 : 0);

  return { state, query, update, setPage, setSort, setSearch, setRange, setFilter, clear, activeFilterCount };
}

export function useTabParam<T extends string>(fallback: T, allowed: readonly T[]) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab = (allowed as readonly string[]).includes(raw ?? "") ? (raw as T) : fallback;
  const setTab = useCallback(
    (next: T) => {
      const search = new URLSearchParams(params.toString());
      if (next === fallback) search.delete("tab");
      else search.set("tab", next);
      for (const key of ["page", "search", "sortBy", "order"]) search.delete(key);
      const query = search.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [fallback, params, pathname, router],
  );
  return [tab, setTab] as const;
}
