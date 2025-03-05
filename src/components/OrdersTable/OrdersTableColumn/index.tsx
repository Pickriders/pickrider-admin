"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { SVG } from "@/components/svg";
import { Order, User } from "@/services";
import dayjs from "dayjs";
import { formatMoney } from "@/utils";

type Status = "INITIATED" | "ACCEPTED" | "ON_GOING" | "COMPLETED" | "CANCELLED" | "PENDING" | "PAID" | "FAILED";

const statusColors: Record<Status, string> = {
  PENDING: "#FFCC00",
  INITIATED: "#D0D4EA",
  ACCEPTED: "#2282C8",
  ON_GOING: "#3E7DF6",
  COMPLETED: "#32BA7C",
  PAID: "#32BA7C",
  CANCELLED: "#FF5244",
  FAILED: "#FF5244",
};

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
    header: "Order No",
    cell: ({ row }) => <p className="font-bold">#{row.original.orderNumber}</p>,
  },
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      const user = row.getValue("user") as User;

      return (
        <UI.TableUser img={user?.photo} name={`${user?.firstname} ${user?.lastname}`} subText={`+${user.phone}`} />
      );
    },
  },
  {
    accessorKey: "rider",
    header: "Courier",
    cell: ({ row }) => {
      const rider = row.original.rider;
      if (!rider) return <p>N/A</p>;

      return (
        <UI.TableUser img={rider?.photo} name={`${rider?.firstname} ${rider?.lastname}`} subText={`+${rider.phone}`} />
      );
    },
  },
  {
    accessorKey: "type",
    header: "Order Type",
    cell: ({ row }) => <p className="text-nowrap">{row.getValue("type")} </p>,
  },
  {
    accessorKey: "amount",
    header: "Order Amount",
    cell: ({ row }) => (
      <p className="text-nowrap">
        Discount: <span className="text-red-500 font-bold">{formatMoney(row.original.discountAmount ?? 0)}</span>
        <br />
        Service Charge: <span className="text-green-500 font-bold">{formatMoney(row.original.serviceCharge ?? 0)}</span>
        <br />
        Negotiated: <span className="text-blue-500 font-bold">{formatMoney(row.original.negotiatedAmount ?? 0)}</span>
        <br />
        Total: <span className="font-bold">{formatMoney(row.original.totalAmountPayable ?? 0)}</span> <br />
      </p>
    ),
  },
  {
    accessorKey: "offers",
    header: "Offers",
    cell: ({ row }) => <p className="text-nowrap">{row.original.offers?.length ?? 0} </p>,
  },
  {
    accessorKey: "createdAt",
    header: "Date/Time",
    cell: ({ row }) => <p className="text-nowrap">{dayjs(row.getValue("createdAt")).format("DD/MM/YYYY hh:mma")}</p>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const color = statusColors[status];

      const statusTimeText = {
        INITIATED: "createdAt",
        ACCEPTED: "acceptedAt",
        ON_GOING: "startedAt",
        COMPLETED: "completedAt",
        CANCELLED: "cancelledAt",
        PENDING: "createdAt",
      };

      return (
        <div>
          <span style={{ color }} className="font-bold">
            {status}
          </span>
          <br />
          <span className="text-nowrap">{dayjs(row.getValue(statusTimeText[status])).format("DD/MM/YYYY hh:mma")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      const color = statusColors[status];

      const statusTimeText = {
        PENDING: "createdAt",
        PAID: "paidDate",
        FAILED: "updatedAt",
      };

      return (
        <div>
          <span style={{ color }} className="font-bold">
            {status}
          </span>
          <br />
          <span className="text-nowrap">{dayjs(row.getValue(statusTimeText[status])).format("DD/MM/YYYY hh:mma")}</span>
        </div>
      );
    },
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return (
        <UI.Button size={"icon"} variant={"outline"} className="rounded-full shrink-0 size-6 [&_svg]:size-2" asChild>
          <Link href={`/orders/${row.original._id}`}>
            <SVG.ChevronRightIcon />
          </Link>
        </UI.Button>
      );
    },
  },
];
