"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useLoginMn } from "@/api";
import { Role } from "@/services";
import { LoaderCircle, ShieldCheck } from "lucide-react";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
});

const FIELD_CLASS =
  "h-12 rounded-xl px-4 pl-11 text-[15px] font-semibold text-foreground bg-background placeholder:font-medium placeholder:text-muted-foreground";

export const LoginForm = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: (values) => {
      loginMutation.mutate({
        password: values.password,
        identifier: values.email,
        role: Role.PLATFORM_ADMIN,
      });
    },
  });

  const loginMutation = useLoginMn(formik.values.rememberMe);

  return (
    <>
      {/* Mobile: logo sits above the form card, centered (desktop shows it in the panel). */}
      <div className="mb-6 flex justify-center lg:hidden">
        <SVG.PickridersLogo className="h-[2.1rem] w-auto" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-3xl border bg-card p-6 shadow-sm sm:p-9"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
        <ShieldCheck size={13} />
        Pickriders Admin
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-[2rem]">Welcome back</h1>
      <p className="mt-2 text-[15px] font-medium text-muted-foreground">
        Sign in to manage orders, couriers, businesses and finances.
      </p>

      <form onSubmit={formik.handleSubmit} className="mt-8" autoComplete="off">
        <div className="space-y-5">
          <UI.Input
            labelValue="Email address"
            labelClassName="text-sm font-bold text-foreground"
            id="email"
            type="email"
            placeholder="you@pickriders.com"
            leftIcon={<SVG.Mail />}
            className={FIELD_CLASS}
            {...formik.getFieldProps("email")}
            errorMessage={formik.touched.email && formik.errors.email}
          />
          <UI.Input
            labelValue="Password"
            labelClassName="text-sm font-bold text-foreground"
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="off"
            leftIcon={<SVG.LockIcon />}
            showToggle
            className={`${FIELD_CLASS} pr-12`}
            errorMessage={formik.touched.password && formik.errors.password}
            {...formik.getFieldProps("password")}
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer items-center gap-2">
              <UI.Checkbox
                checked={formik.values.rememberMe}
                onCheckedChange={(val) => formik.setFieldValue("rememberMe", val)}
              />
              <span className="text-sm font-semibold text-foreground">Remember me</span>
            </label>
            <Link href={"/auth/reset-password"} className="text-sm font-bold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <UI.PrimaryButton
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-8 h-12 rounded-xl text-[15px] font-bold"
        >
          {loginMutation.isPending ? (
            <>
              <LoaderCircle size={20} className="animate-spin" />
              <span className="ml-2">Signing in...</span>
            </>
          ) : (
            "Sign in"
          )}
        </UI.PrimaryButton>
      </form>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ShieldCheck size={13} />
        Protected area — authorized staff only.
      </p>
      </motion.div>
    </>
  );
};
