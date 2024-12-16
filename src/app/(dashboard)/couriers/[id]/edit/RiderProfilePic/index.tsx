import { SVG } from "@/components/svg";

export const RiderProfilePic = () => {
  return (
    <div className="grid">
      <div className="size-[10rem] rounded-full bg-primary-black mx-auto  text-7xl font-semibold font-clash-display grid place-items-center text-white">
        P
      </div>
      <div className="mt-5">
        <input type="file" id="profile-pic" className="hidden" />
        <label
          htmlFor="profile-pic"
          className="flex group cursor-pointer items-center text-primary-gray text-sm font-montserrat font-semibold px-2 py-2 rounded-full bg-muted hover:bg-muted/80 gap-x-3"
        >
          <SVG.UploadIcon />
          Upload Profile Picture
        </label>
      </div>
    </div>
  );
};
