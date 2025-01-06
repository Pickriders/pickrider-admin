"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export const AlertModal = () => {
  const searchParams = useSearchParams();
  const alert = searchParams.get("alert");
  const { closeModal, isOpen } = useQueryModal([
    { key: "alert", value: alert as string },
  ]);

  const alertInfos = {
    error: (
      <>
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
            Error!
          </UI.AlertDialogTitle>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-bold font-montserrat">
            No Permissions given
          </p>
          <p className="text-xs text-primary-gray font-semibold font-montserrat">
            Add at least one permission to continue
          </p>
        </div>
        <UI.AlertDialogFooter className="justify-center">
          <UI.PrimaryButton
            onClick={closeModal}
            variant="outline"
            className="w-full grow"
          >
            Ok, got it
          </UI.PrimaryButton>
        </UI.AlertDialogFooter>
      </>
    ),
    success: (
      <>
        <div className="grid place-items-center">
          <motion.span
            animate={{
              rotate: ["30deg", "0"],
              scale: [0, 1],
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            <SVG.GreenTick width={40} height={40} />
          </motion.span>
          <UI.AlertDialogTitle className="text-[#32BA7C] mt-1 font-semibold font-clash-display">
            Added!
          </UI.AlertDialogTitle>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-primary-gray font-semibold font-montserrat">
            Added members can click on the link sent to their email address to
            complete registration
          </p>
        </div>
        <UI.AlertDialogFooter className="justify-center">
          <UI.PrimaryButton
            onClick={closeModal}
            className="w-full grow bg-[#32BA7C] hover:bg-[#32BA7C]/95 text-white"
          >
            Done
          </UI.PrimaryButton>
        </UI.AlertDialogFooter>
      </>
    ),
  };

  return (
    <UI.AlertDialog open={isOpen}>
      <UI.AlertDialogContent className="text-center w-[25rem]">
        <UI.AlertDialogDescription />
        {alert === "success" && alertInfos.success}
        {alert === "error" && alertInfos.error}
      </UI.AlertDialogContent>
    </UI.AlertDialog>
  );
};
