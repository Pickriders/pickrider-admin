"use client";

import * as React from "react";
import { X } from "lucide-react";
import { UI } from "@/components/ui";
import { cn } from "@/lib/utils";

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <UI.Overlay open={open} openChange={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed left-1/2 top-1/2 z-[70] w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-6 shadow-xl transition-all",
          open ? "visible opacity-100 scale-100" : "invisible opacity-0 scale-95",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-clash-display text-lg font-semibold text-foreground">{title}</h3>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </>
  );
};
