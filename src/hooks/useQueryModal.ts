import { useRouter, usePathname, useSearchParams } from "next/navigation";

export const useQueryModal = (paramKey: string) => {
  const router = useRouter();
  const searchParam = useSearchParams();
  const pathname = usePathname();

  const isOpen = !!searchParam.get(paramKey);

  const closeModal = () => {
    router.replace(pathname);
  };

  return { isOpen, closeModal };
};
