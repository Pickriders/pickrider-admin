"use client";

import { UI } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React from "react";

interface Rider {
  name: string;
  avatar: string;
}

const riders: Rider[] = [
  { name: "John Doe", avatar: "https://example.com/avatars/john-doe.jpg" },
  { name: "Jane Smith", avatar: "https://example.com/avatars/jane-smith.jpg" },
  {
    name: "Alex Johnson",
    avatar: "https://example.com/avatars/alex-johnson.jpg",
  },
  {
    name: "Emily Davis",
    avatar: "https://example.com/avatars/emily-davis.jpg",
  },
  {
    name: "Michael Brown",
    avatar: "https://example.com/avatars/michael-brown.jpg",
  },
  {
    name: "Sarah Wilson",
    avatar: "https://example.com/avatars/sarah-wilson.jpg",
  },
  {
    name: "Chris Taylor",
    avatar: "https://example.com/avatars/chris-taylor.jpg",
  },
  {
    name: "Patricia Miller",
    avatar: "https://example.com/avatars/patricia-miller.jpg",
  },
  {
    name: "Daniel Anderson",
    avatar: "https://example.com/avatars/daniel-anderson.jpg",
  },
  {
    name: "Jessica Thomas",
    avatar: "https://example.com/avatars/jessica-thomas.jpg",
  },
];

export const SelectRider = () => {
  const [selectedRider, setSelectedRider] = React.useState<Rider | null>(null);
  const [searchValue, setSearchValue] = React.useState("");

  const filterData = riders.filter((rider) =>
    rider.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <UI.Popover>
      <UI.PopoverTrigger className="h-10 border rounded-lg w-full px-3 flex  items-center">
        {selectedRider ? (
          <div className="flex items-center gap-x-2">
            <div className="size-[1.96rem] bg-muted rounded-full">
              {/* <Image
                src={selectedRider.avater}
                alt="rider"
                width={20}
                height={20}
                className="w-full h-full rounded-full object-cover"
              /> */}
            </div>
            <span className="text-xs text-primary-purple font-bold font-faktum-test ">
              {selectedRider.name}
            </span>
          </div>
        ) : (
          <span className="text-sm text-primary-gray font-semibold font-montserrat">
            Select Rider
          </span>
        )}

        <ChevronDown size={13} className="ms-auto" />
      </UI.PopoverTrigger>
      <UI.PopoverContent className="w-[--radix-popover-trigger-width] p-3">
        <UI.TableSearchInput
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="py-2 w-full"
        />

        <div className="mt-3 space-y-2 max-h-[15rem] overflow-y-auto scroll-bar">
          {filterData.length > 0 ? (
            filterData.map((rider, i) => {
              const active = selectedRider === rider;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedRider(rider)}
                  className={cn(
                    "flex items-center gap-x-3 p-1 hover:bg-muted/60 w-full rounded-md",
                    active ? "bg-muted/50" : ""
                  )}
                >
                  <div className="size-[1.96rem] bg-muted rounded-full">
                    {/* Uncomment and use when ready */}
                    {/* <Image
              src={rider.avatar}
              alt={rider.name}
              width={20}
              height={20}
              className="w-full h-full rounded-full object-cover"
            /> */}
                  </div>
                  <span className="font-faktum-test font-bold text-xs">
                    {rider.name}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="font-semibold font-clash-display text-sm text-center mt-4">
              No Rider Found!
            </p>
          )}
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};
