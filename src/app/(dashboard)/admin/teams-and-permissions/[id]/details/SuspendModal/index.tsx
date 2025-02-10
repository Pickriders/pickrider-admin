"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { motion } from "framer-motion";
import { SuspendModalProps } from "./SuspendModal.type";

export const SuspendModal = ({ onComfirm }: SuspendModalProps) => {
  const { closeModal, isOpen } = useQueryModal([
    { key: "suspend", value: true },
  ]);

  return (
    <UI.AlertDialog open={isOpen}>
      <UI.AlertDialogContent className="text-center w-[25rem]">
        <UI.AlertDialogDescription />
        <div className="grid place-items-center">
          <motion.span
            animate={{
              rotate: ["0", "25deg", "-25deg", "25deg", "-25deg", "0deg"],
            }}
            transition={{
              duration: 0.3,
              repeat: 2,
              repeatType: "reverse",
            }}
            className="inline-block"
          >
            <SVG.WarningIcon className="stroke-primary" />
          </motion.span>
          <UI.AlertDialogTitle className="text-primary mt-1 font-semibold font-clash-display">
            Suspend!
          </UI.AlertDialogTitle>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-bold font-montserrat">Are you sure?</p>
          <p className="text-xs text-primary-gray font-semibold font-montserrat">
            Suspended members would temporarily loose access to their account
            until access is reinstated.
          </p>
        </div>
        <UI.AlertDialogFooter>
          <UI.PrimaryButton onClick={closeModal} variant="outline">
            Cancel
          </UI.PrimaryButton>
          <UI.PrimaryButton onClick={onComfirm}>Suspend</UI.PrimaryButton>
        </UI.AlertDialogFooter>
      </UI.AlertDialogContent>
    </UI.AlertDialog>
  );
};
