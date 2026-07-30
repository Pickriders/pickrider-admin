"use client";

import { UI } from "@/components/ui";
import { User } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PLATFORM_STAFF_ROLES } from "@/lib/admin-access";

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
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
    accessorKey: "serialNumber",
    cell: ({ row }) => <p>{row.index + 1}</p>,
  },
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <UI.TableUser img={row.original.photo} name={`${row.original.firstname} ${row.original.lastname}`} />
    ),
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => (
      <p className="text-nowrap">
        {row.original.roles.filter((role) => (PLATFORM_STAFF_ROLES as string[]).includes(role)).join(", ") || "—"}
      </p>
    ),
  },
  {
    header: "Email Address",
    accessorKey: "email",
    cell: ({ row }) => <p>{row.original.email}</p>,
  },
  {
    header: "Phone Number",
    accessorKey: "phoneNumber",
    cell: ({ row }) => <p>+{row.original.phone}</p>,
  },
  {
    header: "Date Added",
    accessorKey: "dateAdded",
    cell: ({ row }) => <p className="text-nowrap">{dayjs(row.original.createdAt).format("DD/MM/YY")}</p>,
  },
  {
    header: "action",
    id: "action",
    cell: ({ row }) => (
      <div className=" flex   items-center gap-x-2">
        <Link
          href={`/admin/teams-and-permissions/${row.original._id}/details`}
          className="size-[1.3rem] grid place-items-center rounded-full border"
        >
          <ChevronRight size={12} />
        </Link>
      </div>
    ),
  },
];
