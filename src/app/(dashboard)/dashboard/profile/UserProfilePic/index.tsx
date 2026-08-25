"use client";

import { SVG } from "@/components/svg";
import { useGetUserQuery } from "@/api";

export const UserProfilePic = () => {
  const { data } = useGetUserQuery();
  const initials = `${data?.firstname?.charAt(0) ?? ""}${data?.lastname?.charAt(0) ?? ""}`;

  return (
    <div className="grid place-items-center">
      <div className="size-28 sm:size-[10rem] rounded-full bg-primary-black mx-auto mt-6 sm:mt-[2rem] text-5xl sm:text-7xl font-semibold font-clash-display grid place-items-center text-white uppercase">
        {initials || "?"}
      </div>
      <div className="mt-5">
        <input type="file" id="profile-pic" className="hidden" />
        <label
          htmlFor="profile-pic"
          className="flex group cursor-pointer items-center text-primary-gray text-sm font-montserrat font-semibold px-3 py-2 rounded-full bg-muted hover:bg-muted/80 gap-x-3"
        >
          <SVG.UploadIcon />
          Upload Profile Picture
        </label>
      </div>
    </div>
  );
};
