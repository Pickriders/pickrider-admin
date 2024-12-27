"use client";

import { UI } from "@/components/ui";
import { ChevronDown } from "lucide-react";
import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PermissionAccordionProps {
  triggerIcon: ReactNode;
  triggertext: string;
  permissions: string[];
}

export const PermissionAccordion = ({
  triggerIcon,
  triggertext,
  permissions,
}: PermissionAccordionProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <div className="flex items-center gap-x-3  px-2 ">
        <UI.Switch />
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between py-5 w-full"
        >
          <div className="flex items-center gap-x-3">
            {triggerIcon}
            <span className="font-clash-display font-semibold text-sm text-primary-gray">
              {triggertext}
            </span>
          </div>
          <ChevronDown
            size={15}
            className={cn(
              "transition-transform ease-in-out duration-200",
              open ? "rotate-180" : ""
            )}
          />
        </button>
      </div>
      <motion.div
        initial={{ height: 0 }}
        animate={open ? { height: "auto" } : { height: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <ul className="pl-14">
          {permissions.map((permision, i) => (
            <li
              key={i}
              className="font-clash-display font-medium text-sm text-primary-gray flex items-center gap-x-2 py-4  pr-7 "
            >
              <UI.Switch /> {permision}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};
