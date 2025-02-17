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
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return { updateFilter, searchParams };
};
