"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { SVG } from "@/components/svg";

export type BusinessProps = {
  business: { img: string; name: string };
  earnings: number;
  withdrawals: number;
  debt: number;
  motorbikes: number;
  couriers: number;
  status: "active" | "inactive" | "suspended";
  Verified: boolean;
};

export const businessTableColumn: ColumnDef<BusinessProps>[] = [
  {
    id: "business-select",
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
    accessorKey: "business",
    header: "Business",
    cell: ({ row }) => <UI.TableUser name="Petlin Agro" />,
  },
  {
    accessorKey: "earnings",
    header: "Earnings",
    cell: ({ row }) => "N240,000",
  },
  {
    accessorKey: "withdrawals",
    header: "Withdrawals",
    cell: ({ row }) => "N240,000",
  },
  {
    accessorKey: "motorbikes",
    header: "Motorbikes",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-1">
        32{" "}
        <Link
          href={`/business/${row.index}/vehicles`}
          className="text-[#956810] hover:bg-[#956810]/10 rounded-lg transition-colors duration-200 font-bold py-1 px-1.5"
        >
          View
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "couriers",
    header: "Couriers",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-1">
        32{" "}
        <Link
          href={`/business/${row.index}/couriers`}
          className="text-[#956810] hover:bg-[#956810]/10 rounded-lg transition-colors duration-200 font-bold py-1 px-1.5"
        >
          View
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UI.TableStatus status="ACTIVE" />,
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ row }) => {
      const isVerified = row.getValue("verified") ?? true;
      return (
        <Link href={`/business/${row.index}/verification`} className="group">
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
        </Link>
      );
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
            <Link href={`/business/${row.index}/business-details`}>
              <SVG.ChevronRightIcon />
            </Link>
          </UI.Button>
        </div>
      );
    },
  },
];
