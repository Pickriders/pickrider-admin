"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { SVG } from "@/components/svg";
import { User } from "@/services";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import {
  useGetBusinessQuery,
  useGetBusinessTransactionsCountQuery,
  useGetBusinessWalletsQuery,
} from "@/api/queries/business";

/** Rows are the owner users (role BUSINESS_ADMIN); businessId links the sub-resources. */

const BusinessCell = ({ owner }: { owner: User }) => {
  const { data: business } = useGetBusinessQuery(owner.businessId);
  return (
    <UI.TableUser
      img={business?.photo ?? owner.photo}
      name={business?.name ?? `${owner.firstname} ${owner.lastname}`}
      subText={`+${business?.phone ?? owner.phone}`}
    />
  );
};

const WalletBalanceCell = ({ businessId }: { businessId?: string }) => {
  const { data, isLoading } = useGetBusinessWalletsQuery(businessId);
  if (!businessId) return <span>N/A</span>;
  if (isLoading) return <span>…</span>;
  const wallet = data?.results?.[0];
  if (!wallet) return <span>N/A</span>;
  return (
    <span className="text-nowrap">
      {formatMoney(subUnitToBaseUnit(wallet.balance ?? 0), { currency: wallet.currency })}
    </span>
  );
};

const WithdrawalsCell = ({ businessId }: { businessId?: string }) => {
  const { data, isLoading } = useGetBusinessTransactionsCountQuery(businessId, "DEBIT");
  if (!businessId) return <span>N/A</span>;
  return <span>{isLoading ? "…" : data?.totalRecords ?? 0}</span>;
};

const VehiclesCell = ({ businessId }: { businessId?: string }) => {
  const { data: business } = useGetBusinessQuery(businessId);
  return (
    <div className="flex items-center gap-x-1">
      {business?.vehicles?.length ?? 0}{" "}
      <Link
        href={`/business/${businessId}/vehicles`}
        className="text-[#956810] hover:bg-[#956810]/10 rounded-lg transition-colors duration-200 font-bold py-1 px-1.5"
      >
        View
      </Link>
    </div>
  );
};

const CouriersCell = ({ businessId }: { businessId?: string }) => {
  const { data: business } = useGetBusinessQuery(businessId);
  return (
    <div className="flex items-center gap-x-1">
      {business?.users?.length ?? 0}{" "}
      <Link
        href={`/business/${businessId}/couriers`}
        className="text-[#956810] hover:bg-[#956810]/10 rounded-lg transition-colors duration-200 font-bold py-1 px-1.5"
      >
        View
      </Link>
    </div>
  );
};

const VerifiedCell = ({ owner }: { owner: User }) => {
  const { data: business } = useGetBusinessQuery(owner.businessId);
  const isVerified = business?.kycDetails?.status === "APPROVE";
  return (
    <Link href={`/business/${owner.businessId}/verification`} className="group">
      {isVerified ? (
        <div className="flex items-center font-bold gap-x-4">
          <SVG.VerificationBadgeIcon /> Yes
          <div className="rounded-lg group-hover:bg-[#956810]/10 transition-colors duration-200 p-2">
            <Eye size={15} />
          </div>
        </div>
      ) : (
        <div className="flex items-center font-bold gap-x-2">
          <SVG.HelpIcon />
          No <Eye size={15} />
        </div>
      )}
    </Link>
  );
};

export const businessTableColumn: ColumnDef<User>[] = [
  {
    id: "business-select",
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
    accessorKey: "business",
    header: "Business",
    cell: ({ row }) => <BusinessCell owner={row.original} />,
  },
  {
    accessorKey: "earnings",
    header: "Wallet Balance",
    cell: ({ row }) => <WalletBalanceCell businessId={row.original.businessId} />,
  },
  {
    accessorKey: "withdrawals",
    header: "Withdrawals",
    cell: ({ row }) => <WithdrawalsCell businessId={row.original.businessId} />,
  },
  {
    accessorKey: "motorbikes",
    header: "Motorbikes",
    cell: ({ row }) => <VehiclesCell businessId={row.original.businessId} />,
  },
  {
    accessorKey: "couriers",
    header: "Couriers",
    cell: ({ row }) => <CouriersCell businessId={row.original.businessId} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UI.TableStatus status={row.original.status} />,
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ row }) => <VerifiedCell owner={row.original} />,
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex items-center  gap-x-8">
          <UI.Button
            size={"icon"}
            variant={"outline"}
            className="rounded-full shrink-0 size-6 [&_svg]:size-2"
            asChild
          >
            <Link href={`/business/${row.original.businessId}/business-details`}>
              <SVG.ChevronRightIcon />
            </Link>
          </UI.Button>
        </div>
      );
    },
  },
];
