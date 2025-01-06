"use client";

import { UI } from "@/components/ui";
import { Permissions } from "../Permissions";
import { SVG } from "@/components/svg";
import * as Yup from "yup";
import { useFormik } from "formik";
import { AlertModal } from "./AlertModal";
import React, { Suspense } from "react";
import { useQueryModal } from "@/hooks";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const AddTeamMemberPage = () => {
  const { setParam } = useQueryModal();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      role: "",
      email: "",
      phone: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // console.log(values);
      setParam("alert", "error");
    },
  });

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/admin", label: "Admin" }]}
        rootPageLink="/admin"
        currentPage="Add Team Member"
      />

      <section className="bg-background rounded-lg px-14 py-12 mt-11 ">
        <form onSubmit={formik.handleSubmit}>
          <div className="flex  items-start">
            <div className="flex-1">
              <div className="max-w-[24rem]">
                <UI.PrimaryHeading text="Details" />

                <div className="mt-3">
                  <div className="size-[10rem] rounded-full bg-primary-black mx-auto text-7xl font-semibold font-clash-display grid place-items-center "></div>
                  <div className="grid group place-items-center mt-4">
                    <input type="file" id="profile-pic" className="hidden" />
                    <label
                      htmlFor="profile-pic"
                      className="flex cursor-pointer items-center text-primary-gray text-sm font-montserrat font-semibold px-2 py-2 rounded-full bg-muted hover:bg-muted/80 gap-x-3"
                    >
                      <SVG.UploadIcon />
                      Upload Profile Picture
                    </label>
                  </div>
                </div>
                <div className="mt-5 space-y-5">
                  <UI.Input
                    labelValue="Full Name"
                    id="Full Name"
                    {...formik.getFieldProps("fullName")}
                  />
                  <UI.Input
                    labelValue="Role"
                    id="Role"
                    {...formik.getFieldProps("role")}
                  />
                  <UI.Input
                    labelValue="Email"
                    type="email"
                    id="Email"
                    {...formik.getFieldProps("email")}
                    errorMessage={formik.touched.email && formik.errors.email}
                  />
                  <UI.Input
                    labelValue="Phone"
                    id="Phone"
                    type="tel"
                    {...formik.getFieldProps("phone")}
                  />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <Permissions />
            </div>
          </div>
          <UI.PrimaryButton className="mt-5">Add</UI.PrimaryButton>
        </form>
      </section>

      {/* Alert Modal */}
      <Suspense>
        <AlertModal />
      </Suspense>
    </div>
  );
};
export default AddTeamMemberPage;
