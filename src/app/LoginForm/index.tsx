"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { ToastMessage } from "./Toast";

export const LoginForm = () => {
  const [errorToast, setErrorToast] = React.useState(false);

  const formAction = () => {
    redirect("/dashboard");
    // setErrorToast(true);
  };

  return (
    <form action={formAction} className="relative">
      <ToastMessage showToast={errorToast} close={() => setErrorToast(false)} />
      <h1 className="font-semibold text-2xl font-clash-display">
        Welcome back!
      </h1>
      <div className="mt-12 space-y-3">
        <UI.Input
          labelValue="Email Address"
          id="email"
          type="email"
          leftIcon={<SVG.Mail />}
        />
        <UI.Input
          labelValue="Password"
          id="Password"
          type="password"
          placeholder="Enter password"
          leftIcon={<SVG.LockIcon />}
          showToggle
          className="placeholder:text-primary-gray placeholder:font-montserrat"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1">
            <UI.Checkbox id="remeber me" />
            <UI.Label htmlFor="remeber me">Remember me</UI.Label>
          </div>
          <p className="font-montserrat font-semibold text-primary-gray text-sm">
            Forgot Password?{" "}
            <Link href={""} className="text-primary hover:underline">
              Reset
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-10">
        <UI.PrimaryButton>Login</UI.PrimaryButton>
      </div>
    </form>
  );
};
