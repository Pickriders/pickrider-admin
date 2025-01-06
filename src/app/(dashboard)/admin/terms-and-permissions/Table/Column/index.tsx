"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export type Rows = {
  id: string;
  serialNumber: number;
  name: ReactNode;
  role: string;
  email: string;
  phoneNumber: number;
  dateAdded: Date;
};

export const columns: ColumnDef<Rows>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <UI.Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <UI.Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    header: "S/N",
    accessorKey: "serialNumber",
    cell: ({ row }) => <p>{row.index + 1}</p>,
  },
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => <UI.TableUser name="Nnamani Kester" />,
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => <p>admin</p>,
  },
  {
    header: "Email Address",
    accessorKey: "email",
    cell: ({ row }) => <p>admin</p>,
  },
  {
    header: "Phone Number",
    accessorKey: "phoneNumber",
    cell: ({ row }) => <p>08123456789</p>,
  },
  {
    header: "Date Added",
    accessorKey: "dateAdded",
    cell: ({ row }) => <p>09/12/24</p>,
  },
  {
    header: "action",
    id: "action",
    cell: ({ row }) => (
      <div className=" flex   items-center gap-x-2">
        <UI.Button size={"icon"} variant={"ghost"}>
          <Trash2 color="#FF5244" size={20} />
        </UI.Button>
        <Link
          href={`app-settings/${row.index}/details`}
          className="size-[1.3rem] grid place-items-center rounded-full border"
        >
          <ChevronRight size={12} />
        </Link>
      </div>
    ),
  },
];
