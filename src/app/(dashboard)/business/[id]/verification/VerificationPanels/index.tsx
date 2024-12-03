import { UI } from "@/components/ui";
import { NameLabel } from "../NameLabel";
import { VerifyAccordion } from "../VerifyAccordion";
import Image from "next/image";
import Link from "next/link";

export const VerificationPanel = () => {
  const verified = true;
  return (
    <div className="bg-background  divide-y rounded-2xl py-5 px-6  font-montserrat">
      <VerifyAccordion
        triggerContent={
          <div className="font-montserrat">
            <span className="text-sm font-semibold">KYC verification</span>
            <p className=" text-sm font-semibold">
              <span className="text-primary-gray">Status:</span>{" "}
              <span className="text-[#F9C613]">Pending</span>
            </p>
          </div>
        }
        content={
          <div className="py-3">
            <div className="space-y-5 ">
              <NameLabel label="First Name" value="Nnamani" />
              <NameLabel label="Last Name" value="Kester" />
              <NameLabel label="D.O.B" value="01/07/73" />
              <NameLabel
                label="Address"
                value="33 Monic Estate, Enugu, Nigeria"
              />
              <div>
                <div className="flex items-center gap-x-4">
                  <span className="text-xs font-semibold">Attachment</span>
                  <span className="w-full flex-1 h-[1px] bg-gray-100 dark:bg-gray-100/50" />
                </div>

                <div className="mt-5">
                  <Image
                    alt="demo"
                    src={"/demo-linc.svg"}
                    width={395}
                    height={240}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3">
              {!verified ? (
                <UI.PrimaryButton variant="outline">
                  Suspend Verification
                </UI.PrimaryButton>
              ) : (
                <div className="flex items-center gap-x-4">
                  <UI.PrimaryButton>Verify</UI.PrimaryButton>
                  <UI.PrimaryButton variant="outline" asChild>
                    <Link href={"?reject-business=true"}>Reject</Link>
                  </UI.PrimaryButton>{" "}
                </div>
              )}
            </div>
          </div>
        }
      />
      <VerifyAccordion
        triggerContent={
          <div className="font-montserrat">
            <span className="text-sm font-semibold">KYB verification</span>
            <p className=" text-sm font-semibold">
              <span className="text-primary-gray">Status:</span>{" "}
              <span className="text-[#32BA7C]">Verified</span>
            </p>
          </div>
        }
        content={
          <div className="py-3">
            <div className="space-y-5">
              <NameLabel label="Business Name" value="Peterson Corp" />
              <NameLabel label="Registration Number" value="IBN 123456" />
              <NameLabel label="Registrar Full Name" value="Nnamani Peterson" />
              <NameLabel
                label="Address"
                value="33 Monic Estate, Enugu, Nigeria"
              />
              <div>
                <div className="flex items-center gap-x-4">
                  <span className="text-xs font-semibold">Attachment</span>
                  <span className="w-full flex-1 h-[1px] bg-gray-100 dark:bg-gray-100/50" />
                </div>

                <div className="mt-5">
                  <Image
                    alt="demo"
                    src={"/demo-cert.svg"}
                    width={395}
                    height={240}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3">
              {verified ? (
                <UI.PrimaryButton variant="outline">
                  Suspend Verification
                </UI.PrimaryButton>
              ) : (
                <div className="flex items-center gap-x-4">
                  <UI.PrimaryButton>Verify</UI.PrimaryButton>
                  <UI.PrimaryButton variant="outline" asChild>
                    <Link href={"?reject-business=true"}>Reject</Link>
                  </UI.PrimaryButton>
                </div>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
};
