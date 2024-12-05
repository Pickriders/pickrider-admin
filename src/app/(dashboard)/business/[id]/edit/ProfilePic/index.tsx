import { SVG } from "@/components/svg";

export const ProfilePic = () => {
  return (
    <div>
      <div className="size-[10rem] rounded-full bg-primary-black mx-auto mt-[2rem] text-7xl font-semibold font-clash-display grid place-items-center text-white">
        P
      </div>
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
  );
};
