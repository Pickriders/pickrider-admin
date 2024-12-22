import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../Button";

interface PaginationBtnsProps {
  totalPages: number;
  currentPage: number;
}

export const PaginationBtns = ({
  currentPage,
  totalPages,
}: PaginationBtnsProps) => {
  return (
    <div className="flex items-center gap-x-3">
      <Button variant={"outline"} size={"icon"} className="rounded-full">
        <ChevronLeft size={15} />
      </Button>
      {Array(totalPages)
        .fill(0)
        .map((_, i) => {
          return (
            <Button
              key={i}
              variant={currentPage === i ? "default" : "ghost"}
              size={"icon"}
              className="rounded-full font-semibold font-montserrat"
            >
              {i + 1}
            </Button>
          );
        })}

      <Button variant={"outline"} size={"icon"} className="rounded-full">
        <ChevronRight size={15} />
      </Button>
    </div>
  );
};
