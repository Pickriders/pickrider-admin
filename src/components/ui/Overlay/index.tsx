import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface OverlayProps {
  open?: boolean;
  openChange?: () => void;
  children?: ReactNode;
}

export const Overlay = ({ open, children, openChange }: OverlayProps) => {
  return (
    <div
      onClick={openChange}
      className={cn(
        "fixed  z-50 inset-0 w-full grid place-items-center h-screen bg-black/80",
        open ? "opacity-100 animate-in fade-in-0 visible" : "opacity-0 animate-out fade-out-0 invisible",
      )}
    >
      {children}
    </div>
  );
};
