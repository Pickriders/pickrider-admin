"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { SVG } from "@/components/svg";

export type VehicleProps = {
  assignedTo: { img: string; name: string };
  type: string;
  plateNumber: string;
  couriers: number;
  status: "active" | "inactive" | "suspended";
};

export const vehicleTableColumn: ColumnDef<VehicleProps>[] = [
  {
    id: "vehicles-select",
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
    accessorKey: "plateNumber",
    header: "Plate Number",
    cell: ({ row }) => {
      const isVerified = row.getValue("plateNumber") ?? true;

      return (
        <Link href={`/vehicles/${row.index}/verification`} className="group">
          {isVerified ? (
            <div className="flex items-center font-bold gap-x-4">
              <SVG.VerificationBadgeIcon /> AE225EA
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
      // <div className="flex items-center font-bold gap-x-4">
      //   <SVG.VerificationBadgeIcon /> AE225EA
      //   <div className="rounded-lg group-hover:bg-[#956810]/10 transition-colors duration-200 p-2">
      //     <Eye size={15} />
      //   </div>
      // </div>
    },
  },
  {
    accessorKey: "AssignedTo",
    header: "Assigned to",
    cell: ({ row }) => <UI.TableUser name="Nnamani Kester" />,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <span className="size-[.8rem] inline-block bg-[#FF5244]"></span>
        Bike
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UI.TableStatus status="inactive" />,
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-8">
          <Link
            href={"#"}
            className="hover:bg-[#956810]/10  transition-all duration-500 p-1 rounded-md"
          >
            <SVG.EditIcon />
          </Link>
          <UI.Switch />
        </div>
      );
    },
  },
];
