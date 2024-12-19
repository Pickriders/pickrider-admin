"use client";

import { ColumnDef } from "@tanstack/react-table";

interface FinancesProps {
  transactionId: string;
  type: "payout" | "credit" | "withdrawal";
  date: Date;
  time: Date;
  amount: number;
}

export const columns: ColumnDef<FinancesProps>[] = [
  {
    accessorKey: "transactionId",
    header: "Transaction ID	",
    cell: ({ row }) => <div>#1234567890</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <div>
          <p className="text-[#FF5244]">#1234567890</p>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return <div>09/11/24</div>;
    },
  },
  {
    accessorKey: "time",
    header: "Date",
    cell: ({ row }) => {
      return <div>20:08</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return <div>$4,500</div>;
    },
  },
];
