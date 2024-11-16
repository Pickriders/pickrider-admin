import { cn } from "@/lib/utils";

interface OverlayProps {
  open?: boolean;
}

export const Overlay = ({ open }: OverlayProps) => {
  return (
    <div
      className={cn(
        "fixed  z-50 inset-0 w-full h-screen bg-black/80",
        open
          ? "opacity-100 animate-in fade-in-0 visible"
          : "opacity-0 animate-out fade-out-0 invisible"
      )}
    ></div>
  );
};
