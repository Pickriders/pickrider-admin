import { SVG } from "@/components/svg";
import { motion } from "framer-motion";
import React, { useEffect } from "react";

interface ToastPops {
  showToast: boolean;
  close: () => void;
}

export const ToastMessage = ({ showToast, close }: ToastPops) => {
  useEffect(() => {
    if (showToast === true) {
      const timeoutId = setTimeout(() => {
        close();
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [showToast]);

  return (
    <motion.div
      initial={{ y: -50, visibility: "hidden" }}
      animate={
        showToast
          ? {
              y: 0,
              visibility: "visible",
              opacity: 1,
              transition: { type: "spring", duration: 0.3 },
            }
          : { y: -50, visibility: "hidden", opacity: 0 }
      }
      style={{ translateX: "-50%" }}
      className="w-[30rem] flex items-center gap-x-3 justify-between bg-[#FCD9D7] rounded-xl px-5 py-1.5 absolute left-1/2 -translate-x-1/2 -top-[6rem]"
    >
      <div className="size-[1.8rem] shrink-0  bg-[#FF5244] rounded-full grid place-items-center">
        <SVG.WarningIcon width={15} height={15} className="stroke-white" />
      </div>
      <p className="text-sm text-[#2F0D0B]">
        Oops!! Please you are not able to access your account at the moment.{" "}
      </p>

      <button type="button" onClick={close}>
        <SVG.XIcon width={16} className="dark:stroke-black" />
      </button>
    </motion.div>
  );
};
