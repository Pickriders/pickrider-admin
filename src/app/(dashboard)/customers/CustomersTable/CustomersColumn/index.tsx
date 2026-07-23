"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Link from "next/link";
import { Eye } from "lucide-react";
import { User } from "@/services";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { useGetCustomerCompletedCountQuery, useGetCustomerLatestBalanceQuery } from "@/api/queries/customer";

const BalanceCell = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetCustomerLatestBalanceQuery(userId);
  if (isLoading) return <span className="text-muted-foreground">…</span>;
  if (!data?.hasHistory) return <span className="text-muted-foreground">—</span>;
  return <span className="font-semibold">{formatMoney(subUnitToBaseUnit(data.balance), { currency: data.currency })}</span>;
};

const CompletedCell = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetCustomerCompletedCountQuery(userId);
  return <span>{isLoading ? "…" : `${data ?? 0} completed`}</span>;
};

export const customersColumns: ColumnDef<User>[] = [
  {
    id: "select-customers",
    header: ({ table }) => (
      <UI.Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <UI.Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
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
      return <div>{pageIndex * pageSize + row.index + 1}</div>;
    },
  },
  {
    accessorKey: "firstname",
    header: "Customer",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <Link href={`/customers/${u._id}`} className="group">
          <UI.TableUser
            img={u.photo}
            name={`${u.firstname ?? "N/A"} ${u.lastname ?? ""}`}
            subText={u.phone ? `+${u.phone}` : u.email}
          />
        </Link>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => <BalanceCell userId={row.original._id} />,
  },
  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => <CompletedCell userId={row.original._id} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UI.TableStatus status={row.getValue("status")} />,
  },
  {
    accessorKey: "phoneVerified",
    header: "Verified",
    cell: ({ row }) =>
      row.original.phoneVerified ? (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">Yes</span>
      ) : (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">No</span>
      ),
  },
  {
    accessorKey: "lastLoginDate",
    header: "Last Login",
    cell: ({ row }) => {
      const date = row.getValue("lastLoginDate") as string;
      if (!date) return <div className="text-muted-foreground">N/A</div>;
      return (
        <div className="text-nowrap">
          <p>{dayjs(date).format("h:mm a")}</p>
          <p className="text-muted-foreground">{dayjs(date).format("DD/MM/YY")}</p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <UI.Button variant="outline" size="sm" asChild>
        <Link href={`/customers/${row.original._id}`} className="flex items-center gap-1.5">
          <Eye size={14} />
          View details
        </Link>
      </UI.Button>
    ),
  },
];
