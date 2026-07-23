"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/services";
import dayjs from "dayjs";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import Link from "next/link";

const TYPE_LABELS: Record<Order["type"], string> = {
  SINGLE: "Single Order",
  BATCH: "Batch Delivery",
  BULK: "Bulk Pickup",
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "customer",
    header: "Customer name",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <UI.TableUser
          img={user?.photo}
          name={user ? `${user.firstname} ${user.lastname}` : "N/A"}
          subText={`#${row.original.orderNumber}`}
        />
      );
    },
  },
  {
    accessorKey: "orderType",
    header: "Order Type",
    cell: ({ row }) => <p className="text-nowrap">{TYPE_LABELS[row.original.type] ?? row.original.type}</p>,
  },
  {
    accessorKey: "date",
    header: "Date/Time",
    cell: ({ row }) => {
      return <p className="text-nowrap">{dayjs(row.original.createdAt).format("DD/MM/YY (HH:mm)")}</p>;
    },
  },
  {
    accessorKey: "courier",
    header: "Courier",
    cell: ({ row }) => {
      const rider = row.original.rider;
      if (!rider) return <p>N/A</p>;
      return <UI.TableUser img={rider?.photo} name={`${rider.firstname} ${rider.lastname}`} subText={`+${rider.phone}`} />;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      return (
        <p className="text-nowrap">
          {formatMoney(subUnitToBaseUnit(row.original.totalAmountPayable ?? 0), { currency: row.original.currency })}
        </p>
      );
    },
  },
  {
    accessorKey: "distance",
    header: "Distance",
    cell: ({ row }) => {
      const distance = (row.original.locations ?? []).reduce((sum, location) => sum + (location.distanceTo ?? 0), 0);
      return (
        <div className="flex items-center gap-x-6 text-nowrap">
          {distance.toFixed(1)}km
          <UI.Button size="icon" variant={"ghost"} asChild>
            <Link href={`/orders/${row.original._id}`}>
              <SVG.TrackingIcon />
            </Link>
          </UI.Button>
        </div>
      );
    },
  },
];
