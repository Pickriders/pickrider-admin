import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface QueryParam {
  key: string;
  value: string | boolean;
}

export const useQueryModal = (params?: QueryParam[]) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpen = params && params.some(({ key, value }) => searchParams.get(key) === String(value));

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const setParam = useCallback(
    (name: string, value: string) => {
      router.replace(`?${createQueryString(name, value)}`, { scroll: false });
    },
    [router, createQueryString],
  );

  const getParam = useCallback(
    (param: string) => {
      return searchParams.get(param);
    },
    [searchParams],
  );

  const closeModal = () => {
    if (!params) return;

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete(params[0].key);
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  return { isOpen, closeModal, setParam, getParam };
};
