"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { motion } from "framer-motion";

type SuspendModalProps = {
  onComfirm?: () => void;
};

export const SaveChangesModal = ({ onComfirm }: SuspendModalProps) => {
  const { closeModal, isOpen } = useQueryModal([{ key: "Save", value: true }]);

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
            Save Changes
          </UI.AlertDialogTitle>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-primary-gray font-semibold font-montserrat">
            Changes would be effected immediately. These permissions can be
            revoked anytime.
          </p>
        </div>
        <UI.AlertDialogFooter>
          <UI.PrimaryButton onClick={closeModal} variant="outline">
            Save
          </UI.PrimaryButton>
          <UI.PrimaryButton onClick={onComfirm}>Suspend</UI.PrimaryButton>
        </UI.AlertDialogFooter>
      </UI.AlertDialogContent>
    </UI.AlertDialog>
  );
};
