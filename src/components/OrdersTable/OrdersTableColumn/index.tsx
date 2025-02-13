"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { SVG } from "@/components/svg";
import { Order, User } from "@/services";
import dayjs from "dayjs";

type Status = "INITIATED" | "ACCEPTED" | "ON_GOING" | "COMPLETED" | "CANCELLED";

export const ordersTableColumn: ColumnDef<Order>[] = [
  {
    id: "business-ordersSelect",
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
    accessorKey: "user",
    header: "Customer name",
    cell: ({ row }) => {
      const user = row.getValue("user") as User;

      return <UI.TableUser name={`${user?.firstname} ${user?.lastname}`} subText={`+${user.phone}`} />;
    },
  },
  {
    accessorKey: "type",
    header: "Order Type",
    cell: ({ row }) => <p className="text-nowrap">{row.getValue("type")} </p>,
  },
  {
    accessorKey: "createdAt",
    header: "Date/Time",
    cell: ({ row }) => {
      const date = dayjs(row.getValue("createdAt")).format("MM/DD/YY");

      return <p className="text-nowrap">{date}</p>;
    },
  },
  {
    accessorKey: "rider",
    header: "courier",
    cell: ({ row }) => {
      const rider = row.getValue("rider") as User;
      if (!rider) return <p>N/A</p>;

      return <UI.TableUser name={`${rider?.firstname} ${rider?.lastname}`} subText={`+${rider.phone}`} />;
    },
  },
  {
    accessorKey: "business",
    header: "Business",
    cell: ({ row }) => <p>NIL</p>,
  },
  {
    accessorKey: "status",
    header: "status",
    cell: ({ row }) => {
      const statusColors: Record<Status, string> = {
        INITIATED: "#F9C613",
        ACCEPTED: "#4CAF50",
        ON_GOING: "#2196F3",
        COMPLETED: "#8BC34A",
        CANCELLED: "#F44336",
      };

      const status = (row.getValue("status") as Status) || "INITIATED";
      const color = statusColors[status];

      return <span className={`text-[${color}]`}>{status}</span>;
    },
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-6">
          <button className="bg-black text-nowrap text-white px-3 py-1 rounded-3xl font-montserrat text-xs font-semibold">
            Mark as complete
          </button>
          <UI.Button size={"icon"} variant={"outline"} className="rounded-full shrink-0 size-6 [&_svg]:size-2" asChild>
            <Link href={`/orders/${row.index}`}>
              <SVG.ChevronRightIcon />
            </Link>
          </UI.Button>
        </div>
      );
    },
  },
];
