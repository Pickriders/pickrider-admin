import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useTableUrlFilter = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (value) {
      params.set(key, value);
    } else {
      // Empty value clears the filter (e.g. selecting "All") instead of leaving
      // a stale param in the URL.
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return { updateFilter, searchParams };
};
