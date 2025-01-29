"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { SVG } from "@/components/svg";
import { User } from "@/services";
import dayjs from "dayjs";

// export type CouriersProps = {
//   courier: { img: string; name: string; email: string };
//   phoneNumber: number;
//   address: string;
//   liscenceVerified: boolean;
//   dateJoined: Date;
// };

type liscenceVerified =
  | "APPROVE"
  | "DISAPPROVE"
  | "SUSPENDED"
  | "SUBMITTED"
  | "PENDING";

export const couriersTableColumn: ColumnDef<User>[] = [
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
    accessorKey: "firstname",
    header: "Courier Name	",
    cell: ({ row }) => {
      const firstname = row.getValue("firstname") ?? "N/A";
      const lastname = row.original.lastname ?? "N/A";
      const email = row.original.email ?? "N/A";
      return <UI.TableUser name={`${firstname} ${lastname}`} subText={email} />;
    },
  },
  {
    accessorKey: "phone",
    header: "Phone Number	",
    cell: ({ row }) => <p>{row.getValue("phone")}</p>,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => <p>endim young</p>,
  },
  {
    accessorKey: "driversLicenseVerified",
    header: "Liscence",
    cell: ({ row }) => {
      const isVerified = row.getValue(
        "driversLicenseVerified"
      ) as liscenceVerified;
      return (
        <Link href={`/couriers/${row.index}/verification`} className="group">
          {isVerified === "APPROVE" ? (
            <div className="flex items-center font-bold gap-x-4">
              <SVG.VerificationBadgeIcon /> Verified
              <div className="rounded-lg group-hover:bg-[#956810]/10 transition-colors duration-200 p-2">
                <Eye size={15} />
              </div>
            </div>
          ) : (
            <div className="flex items-center font-bold gap-x-2">
              <SVG.HelpIcon />
              Pending{" "}
              <div className="rounded-lg group-hover:bg-[#956810]/10 transition-colors duration-200 p-2">
                <Eye size={15} />
              </div>
            </div>
          )}
        </Link>
      );
    },
  },
  {
    accessorKey: "dateJoined",
    header: "Date Joined	",
    cell: ({ row }) => {
      const date = row.getValue("lastLoginDate") as Date;
      if (!date) return <div>N/A</div>;

      return <p className="mt-1">1/3/24</p>;
    },
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
