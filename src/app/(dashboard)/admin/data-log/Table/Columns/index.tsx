"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";

export type Rows = {
  id: string;
  user: { name: string; role: string };
  timestamp: Date;
  resource: string;
  status: string;
};

export const columns: ColumnDef<Rows>[] = [
  {
    header: "User",
    accessorKey: "user",
    cell: ({ row }) => (
      <UI.TableUser name="Nnamani Kester" subText="Customer" />
    ),
  },
  {
    header: "Timestamp",
    accessorKey: "timestamp",
    cell: ({ row }) => (
      <div>
        <p>29 Jun 2024</p>
        <span>21:09</span>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <p className="text-center">Action</p>,
    cell: ({ row }) => (
      <div className="text-center">
        <UI.Button variant={"ghost"}>Create</UI.Button>
      </div>
    ),
  },
  {
    header: "Resource",
    accessorKey: "resource",
    cell: ({ row }) => <p>Batch Delivery</p>,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <div>
        <span className="text-[#32BA7C]">Success</span>
      </div>
    ),
  },
  {
    // header: "Date Added",
    id: "query",
    cell: ({ row }) => (
      <UI.Button
        variant={"ghost"}
        className="text-[#2282C8] hover:text-[#2282C8]"
      >
        <SVG.SearchListIcon />
        Query
      </UI.Button>
    ),
  },
];
