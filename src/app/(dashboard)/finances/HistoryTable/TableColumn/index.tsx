"use client";

import { cn } from "@/lib/utils";
import { Transaction } from "@/services";
import { formatMoney, subUnitToBaseUnit, toTitleCase } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "serialNumber",
    header: "S/N",
    cell: ({ table, row }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const globalIndex = pageIndex * pageSize + row.index + 1;

      return <div>{globalIndex}</div>;
    },
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => <p className="text-nowrap">{row.original.reference ?? "N/A"}</p>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <div>
          <p
            className={cn({
              "text-[#FF5244]": row.original.type === "DEBIT",
              "text-[#32BA7C]": row.original.type === "CREDIT",
            })}
          >
            {toTitleCase(row.original.type?.replaceAll("_", " ")) ?? "N/A"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return (
        <p className="text-nowrap">
          {formatMoney(subUnitToBaseUnit(row.original.amount ?? 0), { currency: row.original.currency })}
        </p>
      );
    },
  },
  {
    accessorKey: "charge",
    header: "Charge",
    cell: ({ row }) => {
      return (
        <p className="text-nowrap">
          {formatMoney(subUnitToBaseUnit(row.original.charge ?? 0), { currency: row.original.currency })}
        </p>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <p className="text-nowrap">{toTitleCase(row.original.category?.replaceAll("_", " ")) ?? "N/A"}</p>;
    },
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    cell: ({ row }) => {
      return <p className="text-nowrap">{toTitleCase(row.original.purpose?.replaceAll("_", " ")) ?? "N/A"}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div>
          <p
            className={cn({
              "text-[#FF5244]": row.original.status === "FAILED",
              "text-[#32BA7C]": row.original.status === "SUCCESS",
              "text-[#F6963E]": row.original.status === "PROCESSING",
            })}
          >
            {toTitleCase(row.original.status?.replaceAll("_", " ")) ?? "N/A"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return <p className="text-nowrap">{dayjs(row.original.createdAt).format("DD/MM/YYYY hh:mma")}</p>;
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      return (
        <p className="text-nowrap">
          Before:{" "}
          <span className="font-bold text-[#FF5244]">
            {formatMoney(subUnitToBaseUnit(row.original.balanceBefore ?? 0), { currency: row.original.currency })}
          </span>
          <br />
          After:{" "}
          <span className="font-bold text-[#32BA7C]">
            {formatMoney(subUnitToBaseUnit(row.original.balanceAfter ?? 0), { currency: row.original.currency })}
          </span>
        </p>
      );
    },
  },
];
