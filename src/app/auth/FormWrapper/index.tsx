"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export const FormWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ translateY: 40 }}
      animate={{ translateY: 0 }}
      transition={{ duration: 0.2, ease: "linear", stiffness: 30 }}
    >
      {children}
    </motion.div>
  );
};
