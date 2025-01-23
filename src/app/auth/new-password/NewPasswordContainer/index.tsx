"use client";

import { useSearchParams } from "next/navigation";

import { NewPasswordForm } from "../NewPasswordForm";
import { SuccessMessage } from "../SuccessMessage";

export const NewPasswordContainer = () => {
  const isSuccess = useSearchParams().get("success");

  return (
    <div>
      {!isSuccess ? (
        <>
          <h1 className="font-semibold text-2xl font-clash-display">
            Reset Password
          </h1>
          <div className="mt-8">
            <NewPasswordForm />
          </div>
        </>
      ) : (
        <SuccessMessage />
      )}
    </div>
  );
};
