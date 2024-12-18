"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { motion } from "framer-motion";

export const SuspendVehicleModal = () => {
  const { closeModal, isOpen } = useQueryModal([
    { key: "suspend-vehicle", value: true },
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
            <SVG.WarningIcon />
          </motion.span>
          <UI.AlertDialogTitle className="text-[#FF5244] mt-1 font-semibold font-clash-display">
            Suspend!
          </UI.AlertDialogTitle>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold font-montserrat">Are you sure?</p>
          <p className="text-xs text-primary-gray font-semibold font-montserrat">
            Suspended Vehicle would be rendered inactive until reactivation.
          </p>
        </div>
        <UI.AlertDialogFooter className="justify-center">
          <UI.PrimaryButton
            onClick={closeModal}
            variant="outline"
            className="w-[9rem]"
          >
            Cancel
          </UI.PrimaryButton>
          <UI.PrimaryButton variant="destructive" className="w-[9rem]">
            Delete
          </UI.PrimaryButton>
        </UI.AlertDialogFooter>
      </UI.AlertDialogContent>
    </UI.AlertDialog>
  );
};
