"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { Trash2 } from "lucide-react";
import { Suspense } from "react";
import { DeleteModal } from "../DeleteModal";
import { SuspendModal } from "../SuspendModal";
import { useQueryModal } from "@/hooks";
import { useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { useFormik } from "formik";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export const DetailsForm = () => {
  const { setParam } = useQueryModal([]);
  const searchParams = useSearchParams();
  const isModalOpen = searchParams.get("suspend") || false;

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // console.log(values);
      setParam("save", "true");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="max-w-[24rem]">
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
          defaultValue={"Nnamani Kester"}
          {...formik.getFieldProps("fullName")}
        />
        <UI.Input
          labelValue="Email"
          type="email"
          id="Email"
          defaultValue={"example@gmail.com"}
          {...formik.getFieldProps("email")}
          errorMessage={formik.touched.email && formik.errors.email}
        />
        <UI.Input
          labelValue="Phone"
          id="Phone"
          type="tel"
          defaultValue={"09012345678"}
          {...formik.getFieldProps("phone")}
        />
      </div>
      <UI.PrimaryButton className="mt-5">Save</UI.PrimaryButton>
      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <UI.Switch
            checked={isModalOpen as boolean}
            onCheckedChange={() => setParam("suspend", "true")}
          />{" "}
          <span className="text-sm font-semibold font-clash-display">
            Suspend
          </span>
        </div>
        <div className="flex items-center gap-x-3">
          <UI.Button
            onClick={() => setParam("delete", "true")}
            type="button"
            size={"icon"}
            variant={"ghost"}
          >
            {" "}
            <Trash2 size={18} color="#FF5244" />
          </UI.Button>

          <span className="text-sm font-semibold font-clash-display">
            Remove
          </span>
        </div>
      </div>
      {/* Modal */}
      <Suspense>
        <DeleteModal />
        <SuspendModal />
      </Suspense>
    </form>
  );
};
