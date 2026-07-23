"use client";

import { motion } from "framer-motion";
import { UI } from "@/components/ui";
import Link from "next/link";
import { VerificationModalPeview } from "@/components/VerificationModalPreview";
import { useMemo, useState } from "react";
import { useGetUserDetailsQuery, useVerifyDriversLicenseMn } from "@/api";
import { BadgeCheck, FileText, Maximize2 } from "lucide-react";

interface IVerificationPanel {
  userId: string;
}

export const VerificationPanel = ({ userId }: IVerificationPanel) => {
  const { data, isLoading } = useGetUserDetailsQuery(userId);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const { mutate, isPending: isVerifiying } = useVerifyDriversLicenseMn(userId);

  const handleVerification = () => {
    if (data && data.driversLicense) {
      mutate({
        licenseNumber: data.driversLicense,
        businessId: data.businessId,
        licenseDocument: data.driversLicenseDoc,
      });
    }
  };

  const licenseStatus = useMemo(() => {
    switch (data?.driversLicenseVerified) {
      case "APPROVE":
        return { text: "Verified", color: "#32BA7C", bg: "#32BA7C1a" };
      case "DISAPPROVE":
        return { text: "Rejected", color: "#FF5244", bg: "#FF52441a" };
      case "SUSPENDED":
        return { text: "Suspended", color: "#FF5244", bg: "#FF52441a" };
      case "SUBMITTED":
        return { text: "Awaiting review", color: "#F2A93B", bg: "#F2A93B1a" };
      default:
        return { text: "Pending submission", color: "#64708a", bg: "#64708a1a" };
    }
  }, [data?.driversLicenseVerified]);

  if (!data && isLoading) return <UI.PageLoadingUI />;

  const fullName = data ? `${data.firstname} ${data.lastname}` : "Courier";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Document */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText size={16} className="text-brand-dark" />
          Driver&apos;s licence document
        </div>
        {data?.driversLicenseDoc ? (
          <motion.div layoutId="preview-courier" className="relative mt-4 overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.driversLicenseDoc} alt="Driver's licence" className="w-full object-cover" />
            <button
              onClick={() => setPreviewDoc("preview-courier")}
              className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-lg bg-black/70 text-white transition-transform hover:scale-105"
              aria-label="Expand document"
            >
              <Maximize2 size={16} />
            </button>
          </motion.div>
        ) : (
          <div className="mt-4 grid h-52 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No document uploaded yet.
          </div>
        )}
      </div>

      {/* Details + actions */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-dark">
            <BadgeCheck size={20} />
          </div>
          <div>
            <p className="font-clash-display font-semibold text-foreground">{fullName}</p>
            <p className="text-xs text-muted-foreground">Licence verification</p>
          </div>
          <span
            className="ml-auto rounded-full px-3 py-1 text-xs font-bold"
            style={{ color: licenseStatus.color, backgroundColor: licenseStatus.bg }}
          >
            {licenseStatus.text}
          </span>
        </div>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <dt className="text-xs font-medium text-muted-foreground">Licence number</dt>
            <dd className="text-sm font-semibold text-foreground">{data?.driversLicense || "—"}</dd>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
            <dd className="text-sm font-semibold text-foreground">{data?.phone ? `+${data.phone}` : "—"}</dd>
          </div>
          {data?.driversLicenseVerifiedComment && (
            <div className="border-b pb-3">
              <dt className="text-xs font-medium text-muted-foreground">Review comment</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{data.driversLicenseVerifiedComment}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6">
          {data?.driversLicenseVerified === "APPROVE" ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">
              This courier&apos;s licence is verified.
            </div>
          ) : data?.driversLicenseVerified === "SUBMITTED" ? (
            <div className="flex flex-wrap items-center gap-3">
              <UI.PrimaryButton
                className="w-auto px-6"
                isLoading={isVerifiying}
                loadingText="Verifying..."
                onClick={handleVerification}
              >
                Approve licence
              </UI.PrimaryButton>
              <UI.PrimaryButton disabled={isVerifiying} variant="outline" className="w-auto px-6" asChild>
                <Link scroll={false} href={"?reject-verification=true"}>
                  Reject
                </Link>
              </UI.PrimaryButton>
            </div>
          ) : (
            <div className="rounded-xl bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
              {data?.driversLicense
                ? "Waiting for the courier to submit their licence for review."
                : "This courier hasn't added a driver's licence yet."}
            </div>
          )}
        </div>
      </div>

      <VerificationModalPeview
        closeModal={() => setPreviewDoc(null)}
        layoutId={previewDoc}
        previewImage={data?.driversLicenseDoc || "/demo-linc.svg"}
      />
    </div>
  );
};
