import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { BankPic, Checked, NotChecked } from "../Svg";

interface AccountProps {
  checked: boolean;
  handleSelect: () => void;
}

export const Account = ({ checked = true, handleSelect }: AccountProps) => {
  return (
    <div className="h-[4.35rem] bg-accent/50 w-full py-1 px-7 flex items-center gap-x-16 rounded-lg border">
      <div className="flex items-center gap-x-8">
        <button onClick={handleSelect}>
          {checked ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <Checked />
            </motion.div>
          ) : (
            <NotChecked />
          )}
        </button>
        <div>
          <p className="text-primary-gray font-montserrat">Account Number</p>
          <span className="text-primary-purple font-clash-display">
            11*****456
          </span>
        </div>
      </div>
      <div>
        <p className="text-primary-gray font-montserrat">Account Name</p>
        <span className="text-primary-purple font-clash-display">
          Nnamani Kester
        </span>
      </div>
      <div className="ms-auto flex items-center gap-x-4">
        <div className="size-[1.5rem]">
          <BankPic />
        </div>
        <UI.Button variant={"ghost"} className="p-1">
          <Trash2 color="#FF5244" className="!size-[1.5rem] text-xl" />
        </UI.Button>
        <UI.Button variant={"ghost"} className="p-1">
          <SVG.EditIcon width={25} height={25} className="!size-[1.5rem]" />
        </UI.Button>
      </div>
    </div>
  );
};
