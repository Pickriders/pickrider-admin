"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { generatePagination } from "@/lib/utils";

interface PaginationBtnsProps {
  totalPages: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
}

export const PaginationBtns = ({
  // currentPage,
  totalPages,
  onPageChange,
}: PaginationBtnsProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const router = useRouter();
  const allPages = generatePagination(currentPage, totalPages);

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-x-3">
      <Button
        onClick={() => createPageURL(currentPage - 1)}
        disabled={currentPage === 1}
        variant={"outline"}
        size={"icon"}
        className="rounded-full"
      >
        <ChevronLeft size={15} />
      </Button>
      {allPages.map((page, i) => {
        return (
          <Button
            key={i}
            variant={currentPage === i + 1 ? "default" : "ghost"}
            size={"icon"}
            className="rounded-full font-semibold font-montserrat"
            onClick={() => createPageURL(i + 1)}
          >
            {page}
          </Button>
        );
      })}

      <Button
        onClick={() => createPageURL(currentPage + 1)}
        variant={"outline"}
        disabled={currentPage === totalPages}
        size={"icon"}
        className="rounded-full"
      >
        <ChevronRight size={15} />
      </Button>
    </div>
  );
};
