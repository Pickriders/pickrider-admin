"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { CustomerPhoneVerified } from "../CustomersPhoneVerified";
import dayjs from "dayjs";

export type CustomersProps = {
  balance: number;
  user: { img: string; name: string };
  Verified: boolean;
  status: "active" | "inactive" | "suspended";
  lastLogin: Date;
  orders: number;
};

export const customersColumns: ColumnDef<CustomersProps>[] = [
  {
    id: "customers-select",
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
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => <div>{row.getValue("balance") ?? "460,0000"}</div>,
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => <UI.TableUser name="Nnamani Kester" />,
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ row }) => <CustomerPhoneVerified />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UI.TableStatus status="active" />,
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const date = row.getValue("lastLogin") as Date;

      return (
        <div>
          <p>{dayjs(date).format("h:mm a")}</p>
          <p className="mt-1">{dayjs(date).format("MM/DD/YY")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => <p>{row.getValue("orders") ?? 20} completed</p>,
  },
  {
    header: "Action",
    cell: ({ row }) => <UI.Switch />,
  },
];
