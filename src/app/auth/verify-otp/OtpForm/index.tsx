"use client";

import { UI } from "@/components/ui";
import Link from "next/link";
import { FormWrapper } from "../../FormWrapper";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";

export const OtpForm = () => {
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/auth/new-password");
  };

  return (
    <FormWrapper>
      <form onSubmit={onSubmit}>
        <div className="text-center">
          <label
            htmlFor="Enter OTP"
            className="text-xs text-center font-montserrat text-primary-gray"
          >
            Enter OTP
          </label>
          <div className="mt-1 mx-auto  max-w-96">
            <UI.InputOTP maxLength={200} pattern={REGEXP_ONLY_DIGITS}>
              <UI.InputOTPGroup>
                <UI.InputOTPSlot index={0} />
                <UI.InputOTPSlot index={1} />
                <UI.InputOTPSlot index={2} />
                <UI.InputOTPSlot index={3} />
              </UI.InputOTPGroup>
            </UI.InputOTP>
          </div>
        </div>
        <div className="text-primary-gray mt-7 font-montserrat font-semibold text-xs flex justify-between items-center">
          <p>An OTP was sent to example.gmail.com</p>
          <p>
            Didn’t receive email?
            <button className="text-primary">Resend</button>
          </p>
        </div>
        <div className="mt-9 space-y-3">
          <UI.PrimaryButton>Confirm</UI.PrimaryButton>
          <UI.PrimaryButton variant="outline" asChild>
            <Link href={"/auth/reset-password"}>Cancel</Link>
          </UI.PrimaryButton>
        </div>
      </form>
    </FormWrapper>
  );
};
