import { cn } from "@/lib/utils";
import { UI } from "../ui";
import { X } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface VerificationModalPeviewProps {
  previewImage: string;
  layoutId: string | null;
  closeModal: () => void;
}

export const VerificationModalPeview = ({
  previewImage,
  layoutId,
  closeModal,
}: VerificationModalPeviewProps) => {
  return (
    <UI.Overlay open={layoutId ? true : false}>
      {layoutId && (
        <motion.div layoutId={layoutId}>
          <UI.Card className={cn("pt-1 px-2 pb-10")}>
            <div className="flex justify-end">
              <UI.Button onClick={closeModal} size={"icon"}>
                <X />
              </UI.Button>
            </div>
            <UI.CardContent className="!p-0 mt-1">
              <div className="w-[40rem]">
                <Image alt="demo" src={previewImage} width={707} height={507} />
              </div>
            </UI.CardContent>
          </UI.Card>
        </motion.div>
      )}
    </UI.Overlay>
  );
};
