"use client";
import { SVG } from "@/components/svg";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VerifyAccordionProps {
  triggerContent: React.ReactNode;
  content: React.ReactNode;
}

export const VerifyAccordion = ({
  triggerContent,
  content,
}: VerifyAccordionProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center  py-3 text-right w-full justify-between"
      >
        {triggerContent}
        <span
          className={cn(
            "transition-all duration-300",
            open ? "rotate-180" : "rotate-0"
          )}
        >
          <SVG.ChevronDown width={15} height={15} />
        </span>
      </button>
      <motion.div
        initial={{ height: 0 }}
        animate={open ? { height: "auto" } : { height: 0 }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden"
      >
        {content}
      </motion.div>
    </div>
  );
};
