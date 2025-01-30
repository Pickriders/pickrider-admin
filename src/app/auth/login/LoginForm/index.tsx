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
import { LoaderCircle } from "lucide-react";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    // .matches(/[a-zA-Z]/, "Password must contain at least one letter")
    // .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
});

export const LoginForm = () => {
  const loginMutation = useLoginMn();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
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

  return (
    <form onSubmit={formik.handleSubmit} className="relative" autoComplete="off">
      <h1 className="font-semibold text-2xl font-clash-display">
        Welcome back!
      </h1>
      <motion.div
        initial={{ translateY: 40 }}
        animate={{ translateY: 0 }}
        transition={{ duration: 0.2, ease: "linear", stiffness: 30 }}
      >
        <div className="mt-12 space-y-3">
          <UI.Input
            labelValue="Email Address"
            id="email"
            type="email"
            
            leftIcon={<SVG.Mail />}
            {...formik.getFieldProps("email")}
            errorMessage={formik.touched.email && formik.errors.email}
          />
          <UI.Input
            labelValue="Password"
            id="password"
            type="password"
            placeholder="Enter password"
            autoComplete="off"
            leftIcon={<SVG.LockIcon />}
            showToggle
            className="placeholder:text-primary-gray placeholder:font-montserrat"
            errorMessage={formik.touched.password && formik.errors.password}
            {...formik.getFieldProps("password")}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-1">
              <UI.Checkbox id="remeber me" />
              <UI.Label htmlFor="remeber me">Remember me</UI.Label>
            </div>
            <p className="font-montserrat font-semibold text-primary-gray text-sm">
              Forgot Password?{" "}
              <Link
                href={"/auth/reset-password"}
                className="text-primary hover:underline"
              >
                Reset
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-10">
          <UI.PrimaryButton disabled={loginMutation.isPending}>
            {loginMutation.isPending ? (
              <>
                <LoaderCircle size={20} className="animate-spin" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              "Login"
            )}
          </UI.PrimaryButton>
        </div>
      </motion.div>
    </form>
  );
};
