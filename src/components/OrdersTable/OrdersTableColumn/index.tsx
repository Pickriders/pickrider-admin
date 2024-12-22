"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { SVG } from "@/components/svg";

export type OrdersProps = {
  customer: { img: string; name: string; amount: string };
  orderType: string;
  date: Date;
  courier: { img: string; name: string; plateNum: string };
  Business: string;
  status: "processing";
};

export const ordersTableColumn: ColumnDef<OrdersProps>[] = [
  {
    id: "business-ordersSelect",
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
    accessorKey: "customer",
    header: "Customer name",
    cell: ({ row }) => <UI.TableUser name="Onyebuchi Ekene" subText="#43650" />,
  },
  {
    accessorKey: "orderType",
    header: "Order Type",
    cell: ({ row }) => <p className="text-nowrap">Batch Delivery </p>,
  },
  {
    accessorKey: "date",
    header: "Date/Time	",
    cell: ({ row }) => <p className="text-nowrap">09/11/24 (20:08)</p>,
  },
  {
    accessorKey: "liscenceVerified",
    header: "courier",
    cell: ({ row }) => (
      <UI.TableUser name="Nnamani Kester" subText="ENU-1234" />
    ),
  },
  {
    accessorKey: "business",
    header: "Business",
    cell: ({ row }) => <p>NIL</p>,
  },
  {
    accessorKey: "Status",
    header: "status",
    cell: ({ row }) => (
      <p>
        <span className="text-[#F9C613]">Processing</span>
      </p>
    ),
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-6">
          <button className="bg-black text-nowrap text-white px-3 py-1 rounded-3xl font-montserrat text-xs font-semibold">
            Mark as complete
          </button>
          <UI.Button
            size={"icon"}
            variant={"outline"}
            className="rounded-full shrink-0 size-6 [&_svg]:size-2"
            asChild
          >
            <Link href={`/orders/${row.index}`}>
              <SVG.ChevronRightIcon />
            </Link>
          </UI.Button>
        </div>
      );
    },
  },
];
