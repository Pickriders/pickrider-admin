import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { UploadLicense } from "../UploadLicense";

export const DetailsForm = () => {
  return (
    <form className="w-full ">
      <div className="space-y-5">
        <div className="grid grid-cols-2 items-center gap-x-5 ">
          <UI.Input labelValue="First Name" id="First Name" />
          <UI.Input labelValue="Last Name" id="Last Name" />
        </div>
        <div className="grid grid-cols-2 items-center gap-x-5 ">
          <UI.Input labelValue="Address" id="Address" />
          <UI.Input labelValue="Phone Number" id="Phone Number" type="tel" />
        </div>
        <div className="grid grid-cols-2 items-start gap-x-5 ">
          <UI.Input
            labelValue="Email Address"
            id="Email Address"
            type="email"
          />
          <div>
            <UI.Input
              labelValue="Create Password"
              placeholder="Create Password"
              className="placeholder:invisible"
              id="Create Password"
              type="password"
              showToggle
            />
            <p className="text-primary-gray  font-montserrat text-xs font-semibold mt-1">
              This password would be used by the rider to log into his account
            </p>
          </div>
        </div>
      </div>
      <div className="mt-7">
        <UploadLicense />
      </div>
      <div className="mt-14 flex items-center justify-end gap-x-3">
        <UI.PrimaryButton variant="outline" className="w-[10rem]">
          Cancel
        </UI.PrimaryButton>
        <UI.PrimaryButton
          disabled
          className="w-[10rem] flex items-center gap-x-2"
        >
          <SVG.ShieldUser /> Save
        </UI.PrimaryButton>
      </div>
    </form>
  );
};
