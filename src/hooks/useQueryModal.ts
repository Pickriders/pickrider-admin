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

/**
 * Sets one query param (e.g. `?logout=true` to open the sign-out dialog) from an event handler.
 * Reads the current URL when called instead of subscribing with useSearchParams, so components on
 * every page (the header and sidebar account menus) don't force each page out of prerendering.
 */
export const useSetQueryParam = () => {
  const router = useRouter();
  return useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set(name, value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router],
  );
};
