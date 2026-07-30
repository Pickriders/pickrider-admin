"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { SVG } from "@/components/svg";
import { User } from "@/services";
import dayjs from "dayjs";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { useGetCustomerLatestBalanceQuery } from "@/api/queries/customer";
import { useGetCourierCompletedCountQuery } from "@/api/queries/courier";

type LicenceVerified = "APPROVE" | "DISAPPROVE" | "SUSPENDED" | "SUBMITTED" | "PENDING";

const BalanceCell = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetCustomerLatestBalanceQuery(userId);
  if (isLoading) return <span className="text-muted-foreground">…</span>;
  if (!data?.hasHistory) return <span className="text-muted-foreground">—</span>;
  return <span className="font-semibold">{formatMoney(subUnitToBaseUnit(data.balance), { currency: data.currency })}</span>;
};

const DeliveriesCell = ({ riderId }: { riderId: string }) => {
  const { data, isLoading } = useGetCourierCompletedCountQuery(riderId);
  return <span>{isLoading ? "…" : `${data ?? 0} completed`}</span>;
};

export const couriersTableColumn: ColumnDef<User>[] = [
  {
    id: "business-courierSelect",
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
    cell: ({ table, row }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return <div>{pageIndex * pageSize + row.index + 1}</div>;
    },
  },
  {
    accessorKey: "firstname",
    header: "Courier",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <Link href={`/couriers/${u._id}/details`}>
          <UI.TableUser img={u.photo} name={`${u.firstname ?? "N/A"} ${u.lastname ?? ""}`} subText={u.phone ? `+${u.phone}` : u.email} />
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
    accessorKey: "deliveries",
    header: "Deliveries",
    cell: ({ row }) => <DeliveriesCell riderId={row.original._id} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UI.TableStatus status={row.getValue("status")} />,
  },
  {
    accessorKey: "driversLicenseVerified",
    header: "Licence",
    cell: ({ row }) => {
      const userId = row.original._id;
      const isVerified = row.getValue("driversLicenseVerified") as LicenceVerified;
      return (
        <Link href={`/couriers/${userId}/verification`} className="group inline-flex items-center gap-2 font-semibold">
          {isVerified === "APPROVE" ? (
            <>
              <SVG.VerificationBadgeIcon /> Verified
            </>
          ) : (
            <>
              <SVG.HelpIcon /> {isVerified ? isVerified.charAt(0) + isVerified.slice(1).toLowerCase() : "Pending"}
            </>
          )}
          <Eye size={14} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return <p className="text-nowrap">{date ? dayjs(date).format("DD/MM/YY") : "N/A"}</p>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <UI.Button variant="outline" size="sm" asChild>
        <Link href={`/couriers/${row.original._id}/details`} className="flex items-center gap-1.5">
          <Eye size={14} />
          View details
        </Link>
      </UI.Button>
    ),
  },
];
