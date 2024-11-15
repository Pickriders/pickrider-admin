"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export const LogoutModal = () => {
  const searchParams = useSearchParams();
  const isLogout = searchParams.get("logout");
  const pathname = usePathname();
  const router = useRouter();

  function closeModal() {
    router.replace(`${pathname}`);
  }

  return (
    <UI.AlertDialog open={isLogout ? true : false}>
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
            Log out!
          </UI.AlertDialogTitle>
        </div>

        <div>
          <p className="text-xs font-bold font-montserrat">
            Are you sure you want to log out?
          </p>
          <p className="text-xs text-primary-gray font-semibold font-montserrat">
            Login details would be required when you want to log back in.{" "}
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
            Log out
          </UI.PrimaryButton>
        </UI.AlertDialogFooter>
      </UI.AlertDialogContent>
    </UI.AlertDialog>
  );
};
