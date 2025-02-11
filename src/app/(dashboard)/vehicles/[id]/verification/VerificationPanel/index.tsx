"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { VerificationModalPeview } from "@/components/VerificationModalPreview";
import { Suspense, useState } from "react";
import { RejectVerificationModal } from "./RejectVerificationModal";
import { useGetVehicleQuery, useGetVehiclesQuery, useVerifyVehicleMn } from "@/api";
import { SuspendVerificationModal } from "./SuspendVerificationModal";
import { useQueryModal } from "@/hooks";
import { LoaderCircle } from "lucide-react";
import { dataTagErrorSymbol } from "@tanstack/react-query";

const vehicles = ["/vehic-1.svg", "/vehic-2.svg", "/vehic-3.svg"];

interface VerificationPanelProps {
  vehicleId: string;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ vehicleId }) => {
  const { data: vehicle, error, isLoading } = useGetVehicleQuery(vehicleId);
  const setParam = useQueryModal([{ key: "suspend-vehicle", value: true }]).setParam;
  const verifyVehicle = useVerifyVehicleMn(vehicleId, vehicle?.userId!);

  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const isVerified = vehicle?.status === "VERIFIED";

  const vehicleStatus = React.useMemo(() => {
    switch (vehicle?.status) {
      case "PENDING":
        return { text: "Pending review...", color: "#F9C613" };
      case "VERIFIED":
        return { text: "Verified", color: "#32BA7C" };
      case "REJECTED":
        return { text: "Rejected", color: "#FF5244" };
      case "SUSPENDED":
        return { text: "Suspended", color: "#FF5244" };
      default:
        return { text: "Pending review...", color: "#F9C613" };
    }
  }, [vehicle?.status]);

  if (!vehicle && isLoading) {
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
          <UI.SectionHeader text="Vehicle Type" />
          <p className="font-semibold text-sm text-primary-gray mt-2">Motorbike</p>
        </div>
        <div>
          <UI.SectionHeader text="Vehicle Colour" />
          <p className="font-semibold text-sm text-primary-gray mt-2">{vehicle?.color}</p>
        </div>
        <div>
          <UI.SectionHeader text="Plate Number" />
          <p className="font-semibold text-sm text-primary-gray mt-2">{vehicle?.plateNumber}</p>
        </div>
        <div>
          <UI.SectionHeader text="Status" />
          <p className="font-semibold text-sm  mt-2">
            <span className={`text-[${vehicleStatus.color}]`}>{vehicleStatus.text}</span>
          </p>
        </div>
        <div>
          <UI.SectionHeader text="Comment" />
          <p className="font-semibold text-sm text-primary-gray mt-2">{vehicle?.statusComment}</p>
        </div>

        <div>
          <UI.SectionHeader text="Attachment" />
          <div className="flex items-center gap-x-3 mt-3">
            {vehicle?.photos?.map((img, i) => {
              return (
                <motion.div key={i} layoutId={`preview-${img}`} className="relative w-[18rem]">
                  <Image alt={img} src={img} width={"395"} height={"240"} />
                  <button
                    onClick={() => setPreviewDoc(img)}
                    className="size-10 bg-black group rounded-lg grid place-items-center absolute bottom-2 right-3"
                  >
                    <span className="group-hover:scale-105 transition-all">
                      <SVG.ArrowExpand />
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div>
          {isVerified ? (
            <UI.PrimaryButton onClick={() => setParam("suspend-vehicle", "true")} variant="outline">
              Suspend Verification
            </UI.PrimaryButton>
          ) : (
            <div className="flex items-center gap-x-4">
              <UI.PrimaryButton
                onClick={() => verifyVehicle.mutate()}
                // TODO: Add a loading state
                isLoading={verifyVehicle.isPending}
                loadingText="Verifying.."
              >
                Verify
              </UI.PrimaryButton>
              <UI.PrimaryButton variant="outline" asChild>
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
        layoutId={previewDoc ? `preview-${previewDoc}` : previewDoc}
        previewImage={previewDoc as string}
      />
      <Suspense>
        <RejectVerificationModal />
        <SuspendVerificationModal userId={vehicle?.userId as string} vehicleId={vehicleId} />
      </Suspense>
    </div>
  );
};
