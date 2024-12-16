import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface QueryParam {
  key: string;
  value: string | boolean;
}

export const useQueryModal = (params: QueryParam[]) => {
  const router = useRouter();
  const searchParam = useSearchParams();
  const pathname = usePathname();

  const isOpen = params.some(
    ({ key, value }) => searchParam.get(key) === String(value)
  );

  const closeModal = () => {
    router.replace(pathname, { scroll: false });
  };

  return { isOpen, closeModal };
};
