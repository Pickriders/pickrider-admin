import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { cn } from "@/lib/utils";
import React from "react";

export const SelectedCustomersList = () => {
  const { isOpen, closeModal } = useQueryModal([
    { key: "selected-customers", value: true },
  ]);

  React.useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed w-[32rem] pt-4 px-5 bg-background z-50 h-screen right-0 top-0 shadow-[0px_12px_16px_0px_#00000033] transition-transform duration-500 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between">
        <UI.Button onClick={closeModal}>Close</UI.Button>
        <UI.TableSearchInput className="w-[15rem]" />
      </div>
    </div>
  );
};
