"use client";

import { motion } from "framer-motion";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";

export const VerificationPanel = () => {
  const isVerified = false;
  return (
    <div className="bg-background rounded-2xl p-10  *:font-montserrat">
      <div className="space-y-4">
        <div>
          <UI.SectionHeader text="Expiring Date" />
          <p className="font-semibold text-sm text-primary-gray mt-2">
            23/11/26
          </p>
        </div>
        <div>
          <UI.SectionHeader text="Status" />
          <p className="font-semibold text-sm  mt-2">
            {isVerified ? (
              <span className="text-[#32BA7C]">Verified</span>
            ) : (
              <span className="text-[#F9C613]">Pending verification...</span>
            )}
          </p>
        </div>
        <div>
          <UI.SectionHeader text="Attachment" />
          <motion.div
            layoutId="verification-modal"
            className="mt-3 relative w-[26rem]"
          >
            <Image alt="demo" src={"/demo-linc.svg"} width={395} height={240} />
            <Link
              scroll={false}
              href={"?verification-preview=true"}
              className="size-10 bg-black group rounded-lg grid place-items-center absolute bottom-2 right-3"
            >
              <span className="group-hover:scale-105 transition-all">
                <SVG.ArrowExpand />
              </span>
            </Link>
          </motion.div>
        </div>
        <div>
          {isVerified ? (
            <UI.PrimaryButton variant="outline">
              Suspend Verification
            </UI.PrimaryButton>
          ) : (
            <div className="flex items-center gap-x-4">
              <UI.PrimaryButton>Verify</UI.PrimaryButton>
              <UI.PrimaryButton variant="outline" asChild>
                <Link scroll={false} href={"?verification-reject=true"}>
                  Reject
                </Link>
              </UI.PrimaryButton>{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
