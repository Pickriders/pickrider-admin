"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { SVG } from "@/components/svg";

export type CouriersProps = {
  courier: { img: string; name: string; email: string };
  phoneNumber: number;
  address: string;
  liscenceVerified: boolean;
  dateJoined: Date;
};

export const couriersTableColumn: ColumnDef<CouriersProps>[] = [
  {
    id: "business-courierSelect",
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
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "courier",
    header: "Courier Name	",
    cell: ({ row }) => (
      <UI.TableUser name="Nnamani Kester" subText="kes@email.com" />
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number	",
    cell: ({ row }) => <p>08123456789</p>,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => <p>08123456789</p>,
  },
  {
    accessorKey: "liscenceVerified",
    header: "Liscence",
    cell: ({ row }) => {
      const isVerified = row.getValue("liscenceVerified") ?? true;
      return (
        <div>
          {isVerified ? (
            <div className="flex items-center font-bold gap-x-4">
              <SVG.VerificationBadgeIcon /> Yes
              <div className="rounded-lg group-hover:bg-[#956810]/10 transition-colors duration-200 p-2">
                <Eye size={15} />
              </div>
            </div>
          ) : (
            <div className="flex items-center font-bold gap-x-2">
              <SVG.HelpIcon />
              No <Eye size={15} />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "dateJoined",
    header: "Date Joined	",
    cell: ({ row }) => <p>09/12/24</p>,
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex items-center  gap-x-8">
          <UI.Switch />
          <UI.Button
            size={"icon"}
            variant={"outline"}
            className="rounded-full shrink-0 size-6 [&_svg]:size-2"
            asChild
          >
            <Link href={`/couriers/${row.index}/details`}>
              <SVG.ChevronRightIcon />
            </Link>
          </UI.Button>
        </div>
      );
    },
  },
];
