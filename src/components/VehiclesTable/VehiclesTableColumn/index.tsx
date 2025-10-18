"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { SVG } from "@/components/svg";
import { Vehicle } from "@/services";

export const vehicleTableColumn: ColumnDef<Vehicle>[] = [
  {
    id: "vehicles-select",
    header: ({ table }) => (
      <UI.Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <UI.Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
    ),
  },
  {
    header: "S/N",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span>{row.getValue("name")}</span>,
  },
  {
    accessorKey: "plateNumber",
    header: "Plate Number",
    cell: ({ row }) => {
      const isVerified = row.original.status === "VERIFIED";

      return (
        <Link href={`/vehicles/${row.original._id}/verification`} className="group" title={row.original.statusComment}>
          {isVerified ? (
            <div className="flex items-center font-bold gap-x-4">
              <SVG.VerificationBadgeIcon /> {row.getValue("plateNumber")}
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
    header: "Assigned to",
    cell: ({ row }) => (
      <UI.TableUser
        name={row.original.user ? `${row.original.user?.firstname}  ${row.original.user?.lastname}` : "N/A"}
        img={row.original.user?.photo}
        subText={`+${row.original.user?.phone}`}
        email={row.original.user?.email}
      />
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <span className={`size-[.8rem] inline-block bg-[${row.original.color?.toLowerCase()}]`}></span>
        Motorbike
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UI.TableStatus status={row.original.status} />,
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-8">
          <Link href={"#"} className="hover:bg-[#956810]/10  transition-all duration-500 p-1 rounded-md">
            <SVG.EditIcon />
          </Link>
          <UI.Switch />
        </div>
      );
    },
  },
];
