import { UI } from "@/components/ui";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckedIcon } from "../CheckedIcon";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const checkedIconVariants = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export const SuccessMessage = () => {
  return (
    <motion.div variants={containerVariants} animate="show" initial="hidden">
      <div className="grid place-items-center space-y-2">
        <motion.div variants={checkedIconVariants}>
          <CheckedIcon />
        </motion.div>
        <motion.h4
          variants={itemVariants}
          className="text-2xl font-semibold font-clash-display text-[#32BA7C]"
        >
          Password Reset!
        </motion.h4>
        <motion.p
          variants={itemVariants}
          className="font-clash-display font-semibold text-primary-gray"
        >
          Password has been reset successfully. You can proceed to login page
        </motion.p>
      </div>
      <motion.div variants={itemVariants}>
        <UI.PrimaryButton asChild className="mt-8">
          <Link href={"/"}>Proceed to Login</Link>
        </UI.PrimaryButton>
      </motion.div>
    </motion.div>
  );
};
