import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

export const PageLoadingUI = ({ className }: { className?: string }) => {
  return (
    <div className={cn("bg-background rounded-2xl p-10 h-[25rem] grid place-items-center", className)}>
      <LoaderCircle size={100} className="animate-spin text-neutral-400" />
    </div>
  );
};
