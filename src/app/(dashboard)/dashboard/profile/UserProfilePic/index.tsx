"use client";

import { SVG } from "@/components/svg";

export const UserProfilePic = () => {
  return (
    <div className="grid group place-items-center ">
      <input type="file" id="profile-pic" className="hidden" />
      <label
        htmlFor="profile-pic"
        className="flex cursor-pointer items-center text-primary-gray text-sm font-montserrat font-semibold px-2 py-2 rounded-full bg-muted hover:bg-muted/80 gap-x-3"
      >
        <SVG.UploadIcon />
        Upload Profile Picture
      </label>
    </div>
  );
};
