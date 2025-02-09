"use client";

import { motion } from "framer-motion";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { VerificationModalPeview } from "@/components/VerificationModalPreview";
import { useMemo, useState } from "react";
import { useGetUserDetailsQuery, useVerifyDriversLicense2 } from "@/api";
import { LoaderCircle } from "lucide-react";

interface IVerificationPanel {
  userId: string;
}

export const VerificationPanel = ({ userId }: IVerificationPanel) => {
  const { data, isLoading, error, isError } = useGetUserDetailsQuery(userId);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const { mutate, isPending: isVerifiying } = useVerifyDriversLicense2(userId);

  const handleVerification = async () => {
    mutate();
  };

  const licenseStatus = useMemo(() => {
    switch (data?.driversLicenseVerified) {
      case "PENDING":
        return { text: "Pending verification...", color: "#F9C613" };
      case "APPROVE":
        return { text: "Verified", color: "#32BA7C" };
      case "DISAPPROVE":
        return { text: "Rejected", color: "#FF5244" };
      case "SUSPENDED":
        return { text: "Suspended", color: "#FF5244" };
      default:
        return { text: "Pending verification...", color: "#F9C613" };
    }
  }, [data?.driversLicenseVerified]);

  if (!data && isLoading) {
    return (
      <div className="bg-background rounded-2xl p-10 h-[25rem] grid place-items-center">
        <LoaderCircle size={40} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl p-10  *:font-montserrat">
      <div className="space-y-4">
        <div>
          <UI.SectionHeader text="Expiring Date" />
          <p className="font-semibold text-sm text-primary-gray mt-2">23/11/26</p>
        </div>
        <div>
          <UI.SectionHeader text="Status" />
          <p className="font-semibold text-sm  mt-2">
            <span className={`text-[${licenseStatus.color}]`}>{licenseStatus.text}</span>
          </p>
        </div>
        <div>
          <UI.SectionHeader text="Attachment" />
          <motion.div layoutId="preview-courier" className="mt-3 relative w-[26rem]">
            <Image alt="demo" src={"/demo-linc.svg"} width={395} height={240} />
            <button
              onClick={() => setPreviewDoc("preview-courier")}
              className="size-10 bg-black group rounded-lg grid place-items-center absolute bottom-2 right-3"
            >
              <span className="group-hover:scale-105 transition-all">
                <SVG.ArrowExpand />
              </span>
            </button>
          </motion.div>
        </div>
        <div>
          {data?.driversLicenseVerified === "APPROVE" ? (
            <UI.PrimaryButton variant="outline">Suspend Verification</UI.PrimaryButton>
          ) : (
            <div className="flex items-center gap-x-4">
              <UI.PrimaryButton disabled={isVerifiying} onClick={handleVerification}>
                {isVerifiying ? (
                  <div className="flex items-center gap-x-1">
                    <LoaderCircle size={15} className="animate-spin" /> Verifying...
                  </div>
                ) : (
                  "Verify"
                )}
              </UI.PrimaryButton>
              <UI.PrimaryButton disabled={isVerifiying} variant="outline" asChild>
                <Link scroll={false} href={"?reject-verification=true"}>
                  Reject
                </Link>
              </UI.PrimaryButton>{" "}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <VerificationModalPeview
        closeModal={() => setPreviewDoc(null)}
        layoutId={previewDoc}
        previewImage={"/demo-linc.svg"}
      />
    </div>
  );
};
