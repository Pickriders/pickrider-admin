"use client";

import * as React from "react";

interface TableUser {
  name: string;
  img?: string;
  subText?: string;
  email?: string;
}

const initialsOf = (name: string) =>
  name
    ?.split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const TableUser = ({ name, subText, img, email }: TableUser) => {
  const [broken, setBroken] = React.useState(false);

  return (
    <div className="flex items-center gap-x-2">
      <div className="grid size-[1.7rem] shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
        {img && !broken ? (
          // Plain img (not next/image): avatars come from arbitrary, sometimes
          // broken hosts — on error we fall back to initials instead of 500ing.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={name} className="size-full object-cover" onError={() => setBroken(true)} />
        ) : (
          initialsOf(name)
        )}
      </div>
      <div className="text-nowrap">
        <p className="font-semibold font-faktum-test">{name}</p>
        {email && <p>{email}</p>}
        {subText && <p className="text-muted-foreground">{subText}</p>}
      </div>
    </div>
  );
};
