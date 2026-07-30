"use client";

import { UI } from "@/components/ui";
import { User } from "@/services";
import { Check, Phone } from "lucide-react";
import * as React from "react";

interface CourierDetailsProps {
  rider?: User;
}

const Avatar = ({ rider }: { rider?: User }) => {
  const [broken, setBroken] = React.useState(false);
  const initials = rider ? `${rider.firstname?.[0] ?? ""}${rider.lastname?.[0] ?? ""}`.toUpperCase() : "";
  return (
    <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-black text-[11px] font-semibold text-white">
      {rider?.photo && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={rider.photo} alt={rider.firstname} className="size-full object-cover" onError={() => setBroken(true)} />
      ) : (
        initials || "—"
      )}
    </div>
  );
};

export const CourierDetails: React.FC<CourierDetailsProps> = ({ rider }) => {
  return (
    <div className="mt-8">
      <UI.SectionHeader text="Courier details" />

      {rider ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-x-2">
            <Avatar rider={rider} />
            <div>
              <h2 className="font-faktum-test text-xs font-bold text-primary-purple">
                {rider.firstname} {rider.lastname}
              </h2>
              <span className="text-xs text-primary-gray">Courier{rider.phone ? ` · +${rider.phone}` : ""}</span>
            </div>
          </div>
          <div className="flex items-center gap-x-1.5">
            <span className="flex items-center gap-x-1 rounded-md bg-[#DEF4F2] px-3 py-2 font-faktum-test text-[.6rem] font-bold text-[#3FA49F]">
              <Check size={13} color="#3FA49F" />
              Rider assigned
            </span>
            {rider.phone && (
              <UI.Button size={"icon"} className="h-[2.5rem] w-[3rem]" asChild>
                <a href={`tel:+${rider.phone}`} aria-label="Call courier">
                  <Phone className="!size-[1.3rem]" />
                </a>
              </UI.Button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
          No rider has been assigned to this order yet.
        </div>
      )}
    </div>
  );
};
