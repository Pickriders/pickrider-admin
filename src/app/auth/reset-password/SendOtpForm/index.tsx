"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { FormWrapper } from "../../FormWrapper";
import * as Yup from "yup";
import { FormikHelpers, FormikValues, useFormik } from "formik";

interface FormValues {
  email: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export const SendOtpForm = () => {
  const [error, setError] = React.useState("");
  const router = useRouter();

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "example@gmail.com",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, formikHelpers) => {
      router.push("/auth/verify-otp");
      formikHelpers.setSubmitting(false);
    },
  });

  return (
    <FormWrapper>
      <form onSubmit={formik.handleSubmit}>
        <UI.Input
          labelValue="Email Address"
          id="Email Address"
          name="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          className={`${
            formik.touched.email && formik.errors.email
              ? "focus-visible:ring-[#FF5244]/60"
              : ""
          }`}
          leftIcon={<SVG.Mail />}
        />
        {formik.touched.email && formik.errors.email ? (
          <div className="text-[#FF5244] text-xs font-montserrat font-semibold mt-1">
            {formik.errors.email}
          </div>
        ) : null}
        {error && (
          <p className="text-[#FF5244] text-xs font-semibold font-montserrat mt-2 text-center">
            Email address not found!
          </p>
        )}

        <div className="mt-7 space-y-3">
          <UI.PrimaryButton disabled={!formik.values.email}>
            Send O.T.P
          </UI.PrimaryButton>
          <UI.PrimaryButton variant="outline" asChild>
            <Link href={"/auth/login"}>Cancel</Link>
          </UI.PrimaryButton>
        </div>
      </form>
    </FormWrapper>
  );
};
