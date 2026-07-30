import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useURLQuery = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Always build from the LIVE URL, not the render-time snapshot. Otherwise a
  // navigation triggered from a stale closure (e.g. a debounced search that
  // fires after you've already switched tabs) would rebuild the query from an
  // outdated snapshot and revert your latest change — causing a back-and-forth
  // oscillation between tabs.
  const currentParams = () =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams(searchParams);

  const commit = (params: URLSearchParams) => {
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    // Skip no-op navigations entirely (prevents redundant replace() churn).
    if (typeof window !== "undefined" && next === `${pathname}${window.location.search}`) return;
    replace(next);
  };

  const set = (key: string, value: string) => {
    const params = currentParams();
    if (value) params.set(key, value);
    else params.delete(key);
    commit(params);
  };

  const setMultiple = (entries: Record<string, string | undefined>) => {
    const params = currentParams();
    Object.entries(entries).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    commit(params);
  };

  const get = (key: string) => {
    return searchParams.get(key) ?? "";
  };

  const remove = (key: string) => {
    const params = currentParams();
    params.delete(key);
    commit(params);
  };

  const removeMultiple = (keys: string[]) => {
    const params = currentParams();
    keys.forEach((key) => params.delete(key));
    commit(params);
  };

  const removeAll = () => {
    commit(new URLSearchParams());
  };

  return { set, get, remove, searchParams, setMultiple, removeMultiple, removeAll };
};
