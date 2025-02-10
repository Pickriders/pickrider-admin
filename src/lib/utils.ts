import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  const maxPages = 5;
  const pagination: (number | string)[] = [];

  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pagination.push(1);

  if (currentPage > 3) {
    pagination.push("...");
  }

  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  for (let i = startPage; i <= endPage; i++) {
    pagination.push(i);
  }

  if (currentPage < totalPages - 2) {
    pagination.push("...");
  }

  pagination.push(totalPages);

  return pagination;
};
