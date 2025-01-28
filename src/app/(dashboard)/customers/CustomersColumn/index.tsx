"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { User } from "@/services";
import { CustomerPhoneVerified } from "../CustomersTable/CustomersPhoneVerified";

export const customersColumns: ColumnDef<User>[] = [
  {
    id: "select-customers",
    header: ({ table }) => (
      <UI.Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <UI.Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          console.log(value);
          console.log(row.getIsSelected());
          row.toggleSelected(!!value);
        }}
        aria-label="select-customers"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "S/N",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  // {
  //   accessorKey: "balance",
  //   header: "Balance",
  //   cell: ({ row }) => <div>{row.getValue("balance") ?? "460,0000"}</div>,
  // },
  {
    accessorKey: "lastname",
    header: "User",
    cell: ({ row }) => {
      return <UI.TableUser name={`${row.getValue("lastname") ?? "N/A"}`} />;
    },
  },
  {
    accessorKey: "phoneVerified",
    header: "Verified",
    cell: ({ row }) => (
      <CustomerPhoneVerified verified={row.getValue("phoneVerified")} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <UI.TableStatus status={row.getValue("status")} />;
    },
  },
  {
    accessorKey: "lastLoginDate",
    header: "Last Login",
    cell: ({ row }) => {
      const date = row.getValue("lastLoginDate") as Date;
      if (!date) return <div>N/A</div>;

      return (
        <div>
          <p>{dayjs(date).format("h:mm a")}</p>
          <p className="mt-1">{dayjs(date).format("MM/DD/YY")}</p>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "orders",
  //   header: "Orders",
  //   cell: ({ row }) => <p>{row.getValue("orders") ?? 20} completed</p>,
  // },
  {
    header: "Action",
    cell: ({ row }) => <UI.Switch />,
  },
];
