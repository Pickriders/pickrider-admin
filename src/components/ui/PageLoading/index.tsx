import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

export const PageLoadingUI = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "bg-background  absolute left-0 w-full top-0 h-[calc(100vh_-6.2rem)] p-10  grid place-items-center",
        className,
      )}
    >
      <LoaderCircle size={100} className="animate-spin text-neutral-400" />
    </div>
  );
};
