"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { CustomerPhoneVerified } from "../CustomersPhoneVerified";
import dayjs from "dayjs";
import { User } from "@/services";

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
    id: "serialNumber",
    header: "S/N",
    cell: ({ table, row }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const globalIndex = pageIndex * pageSize + row.index + 1;

      console.log(pageSize, pageIndex);
      return <div>{globalIndex}</div>;
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => <div>{row.getValue("balance") ?? "460,0000"}</div>,
  },
  {
    accessorKey: "firstname",
    header: "User",
    cell: ({ row }) => {
      const firstname = row.getValue("firstname") ?? "N/A";
      const lastname = row.original.lastname ?? "N/A";
      return <UI.TableUser name={`${firstname} ${lastname}`} />;
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
