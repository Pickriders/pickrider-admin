"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";

export type Row = {
  id: number;
  country: string;
};

export const columns: ColumnDef<Row>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <div>
        <UI.Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-gray-600"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "country",
    cell: ({ row }) => (
      <div className="text-sm   font-medium text-gray-200 flex items-center gap-x-5">
        <div className="text-sm  text-gray-400">{row.index + 1}.</div>
        Nigeria
      </div>
    ),
  },
  {
    id: "action",
    cell: ({ row }) => (
      <div className=" flex justify-end  items-center gap-x-2">
        <UI.Button size={"icon"} variant={"ghost"}>
          <Trash2 color="#FF5244" size={20} />
        </UI.Button>
        <Link
          href={`app-settings/${row.index}/country-details`}
          className="size-[1.3rem] grid place-items-center rounded-full border"
        >
          <ChevronRight size={12} />
        </Link>
      </div>
    ),
  },
];
