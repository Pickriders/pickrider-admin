import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const Details = () => {
  return (
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
        <UI.Input labelValue="Full Name" id="Full Name" />
        <UI.Input labelValue="Role" id="Role" />
        <UI.Input labelValue="Email" type="email" id="Email" />
        <UI.Input labelValue="Phone" id="Phone" type="tel" />
      </div>
    </div>
  );
};
