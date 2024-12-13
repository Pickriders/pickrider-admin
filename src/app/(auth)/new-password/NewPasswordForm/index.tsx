"use client";

import { UI } from "@/components/ui";
import { SVG } from "@/components/svg";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FormWrapper } from "../../FormWrapper";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-zA-Z]/, "Password must contain at least one letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

export const NewPasswordForm = () => {
  const router = useRouter();

  const handleSubmit = (values: any, { setSubmitting }: any) => {
    router.push("?success=true");
    setSubmitting(false);
  };

  return (
    <div>
      <FormWrapper>
        <Formik
          initialValues={{ newPassword: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <div className="space-y-4">
                <div>
                  <Field name="newPassword">
                    {({ field }: any) => (
                      <UI.Input
                        id="newPassword"
                        labelValue="Create New Password"
                        placeholder="Enter password"
                        leftIcon={<SVG.LockIcon />}
                        type="password"
                        showToggle
                        className={`${
                          touched.newPassword && errors.newPassword
                            ? "focus-visible:ring-[#FF5244]/60"
                            : ""
                        }`}
                        {...field}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    className="text-[#FF5244] text-xs font-montserrat font-semibold mt-1"
                  />
                </div>
                <div>
                  <Field name="confirmPassword">
                    {({ field }: any) => (
                      <UI.Input
                        id="confirmPassword"
                        labelValue="Confirm New Password"
                        placeholder="Enter password again"
                        leftIcon={<SVG.LockIcon />}
                        type="password"
                        showToggle
                        className={`${
                          touched.confirmPassword && errors.confirmPassword
                            ? "focus-visible:ring-[#FF5244]/60 "
                            : ""
                        }`}
                        {...field}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-[#FF5244] text-xs font-montserrat font-semibold mt-1"
                  />
                </div>
              </div>
              <div className="space-y-3 mt-10">
                <UI.PrimaryButton type="submit" disabled={isSubmitting}>
                  Save & Proceed
                </UI.PrimaryButton>
                <UI.PrimaryButton variant="outline" asChild>
                  <Link href={"/verify-otp"}>Cancel</Link>
                </UI.PrimaryButton>
              </div>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  );
};
