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
import { useGetUserDetailsQuery } from "@/api/queries/user";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

export const DetailsForm = ({ userId }: { userId: string }) => {
  const { setParam } = useQueryModal([]);
  const searchParams = useSearchParams();
  const isModalOpen = searchParams.get("suspend") || false;
  const { data: user } = useGetUserDetailsQuery(userId);

  const formik = useFormik({
    initialValues: {
      fullName: user ? `${user.firstname} ${user.lastname}` : "",
      email: user?.email ?? "",
      phone: user?.phone ? `+${user.phone}` : "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: () => {
      setParam("save", "true");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="max-w-[24rem]">
      <UI.PrimaryHeading text="Details" />

      <div className="mt-3">
        <div className="size-[10rem] rounded-full bg-primary-black text-white mx-auto text-7xl font-semibold font-clash-display grid place-items-center overflow-hidden">
          {user?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photo} alt={user.firstname} className="size-full object-cover" />
          ) : (
            (user?.firstname?.[0] ?? "") + (user?.lastname?.[0] ?? "")
          )}
        </div>
        <div className="grid group place-items-center mt-4">
          <input type="file" id="profile-pic" className="hidden" disabled />
          <label
            htmlFor="profile-pic"
            className="flex cursor-not-allowed items-center text-primary-gray text-sm font-montserrat font-semibold px-2 py-2 rounded-full bg-muted opacity-60 gap-x-3"
            title="Only the member can change their own photo — no admin endpoint exists yet."
          >
            <SVG.UploadIcon />
            Upload Profile Picture
          </label>
        </div>
      </div>
      <div className="mt-5 space-y-5">
        <UI.Input labelValue="Full Name" id="Full Name" {...formik.getFieldProps("fullName")} readOnly />
        <UI.Input
          labelValue="Email"
          type="email"
          id="Email"
          {...formik.getFieldProps("email")}
          errorMessage={formik.touched.email && formik.errors.email}
          readOnly
        />
        <UI.Input labelValue="Phone" id="Phone" type="tel" {...formik.getFieldProps("phone")} readOnly />
      </div>
      <p className="mt-3 text-xs text-primary-gray font-montserrat">
        Profile fields are read-only — the core API has no admin endpoint to edit another user&apos;s profile yet.
      </p>
      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <UI.Switch checked={isModalOpen as boolean} onCheckedChange={() => setParam("suspend", "true")} />{" "}
          <span className="text-sm font-semibold font-clash-display">Suspend</span>
        </div>
        <div className="flex items-center gap-x-3">
          <UI.Button onClick={() => setParam("delete", "true")} type="button" size={"icon"} variant={"ghost"}>
            {" "}
            <Trash2 size={18} color="#FF5244" />
          </UI.Button>

          <span className="text-sm font-semibold font-clash-display">Remove</span>
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
