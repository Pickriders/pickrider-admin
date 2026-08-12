"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { SVG } from "@/components/svg";
import { User } from "@/services";
import dayjs from "dayjs";
import { formatMoney, subUnitToBaseUnit } from "@/utils";

type LicenceVerified = "APPROVE" | "DISAPPROVE" | "SUSPENDED" | "SUBMITTED" | "PENDING";

// The rider list now returns these lifetime metrics inline (see backend findAll).
type RiderRow = User & { completedDeliveries?: number; totalEarned?: number; currency?: string };

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
    header: "#",
    cell: ({ table, row }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const rank = pageIndex * pageSize + row.index + 1;
      const medal =
        rank === 1
          ? "bg-amber-100 text-amber-700"
          : rank === 2
            ? "bg-zinc-200 text-zinc-700"
            : rank === 3
              ? "bg-orange-100 text-orange-700"
              : "text-muted-foreground";
      return (
        <span className={`grid size-6 place-items-center rounded-full text-xs font-bold ${rank <= 3 ? medal : ""}`}>
          {rank}
        </span>
      );
    },
  },
  {
    accessorKey: "firstname",
    header: "Courier",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <Link href={`/couriers/${u._id}/details`}>
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
    id: "deliveries",
    header: "Deliveries",
    cell: ({ row }) => {
      const r = row.original as RiderRow;
      return <span className="font-semibold text-nowrap">{r.completedDeliveries ?? 0}</span>;
    },
  },
  {
    id: "amountMade",
    header: "Amount made",
    cell: ({ row }) => {
      const r = row.original as RiderRow;
      return (
        <span className="font-semibold text-nowrap">
          {formatMoney(subUnitToBaseUnit(r.totalEarned ?? 0), { currency: r.currency ?? "NGN" })}
        </span>
      );
    },
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UI.TableStatus status={row.getValue("status")} />,
  },
  {
    accessorKey: "lastLoginDate",
    header: "Last login",
    cell: ({ row }) => {
      const d = (row.original as RiderRow).lastLoginDate;
      return (
        <p className="text-nowrap text-muted-foreground">{d ? dayjs(d).format("DD/MM/YY, HH:mm") : "Never"}</p>
      );
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
