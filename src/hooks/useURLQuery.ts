import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useURLQuery = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const set = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const setMultiple = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    replace(`${pathname}?${newParams.toString()}`);
  };

  const get = (key: string) => {
    return searchParams.get(key) ?? "";
  };

  const remove = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    replace(`${pathname}?${params.toString()}`);
  };

  return { set, get, remove, searchParams, setMultiple };
};
