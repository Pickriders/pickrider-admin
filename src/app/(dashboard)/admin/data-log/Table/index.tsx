"use client";

import { UI } from "@/components/ui";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { Suspense } from "react";
import { Filter } from "./Filter";
import { SVG } from "@/components/svg";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});

  return (
    <div className="bg-background rounded-xl pb-4 border">
      <div className="px-[1.4rem] py-5 flex items-center gap-x-1 ">
        <UI.TableSearchInput />
        <Filter />
      </div>
      <div className="overflow-x-auto  w-full  scroll-bar">
        <UI.Table>
          <UI.TableHeader>
            <UI.TableHead>User</UI.TableHead>
            <UI.TableHead>Timestamp</UI.TableHead>
            <UI.TableHead>Action</UI.TableHead>
            <UI.TableHead>Resource</UI.TableHead>
            <UI.TableHead>Status</UI.TableHead>
          </UI.TableHeader>
          <UI.TableBody>
            <UI.TableRow>
              <UI.TableCell>
                <UI.TableUser name="Nnamani Kester" subText="Customer" />
              </UI.TableCell>
              <UI.TableCell>
                <div>
                  <p>29 Jun 2024</p>
                  <span>21:09</span>
                </div>
              </UI.TableCell>
              <UI.TableCell>
                <UI.Button variant={"ghost"}>Create</UI.Button>
              </UI.TableCell>
              <UI.TableCell>Batch Delivery</UI.TableCell>
              <UI.TableCell>
                <span className="text-[#32BA7C]">Success</span>
              </UI.TableCell>
              <UI.TableCell>
                <UI.Button
                  variant={"ghost"}
                  className="text-[#2282C8] hover:text-[#2282C8]"
                >
                  <SVG.SearchListIcon />
                  Query
                </UI.Button>
              </UI.TableCell>
            </UI.TableRow>
          </UI.TableBody>
        </UI.Table>
      </div>
    </div>
  );
}
