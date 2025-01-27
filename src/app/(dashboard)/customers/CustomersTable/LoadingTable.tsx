"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/services";

interface LoadingTableProps {
  columns: ColumnDef<User, any>[];
}

const tableHead = [
  "",
  "S/N",
  "User",
  "Verifield",
  "Status",
  "Last Login",
  "Action",
];

export const LoadingTable = ({ columns }: LoadingTableProps) => {
  return (
    <div className="bg-background rounded-lg pb-6 w-full">
      {/* Query components */}
      <div className="px-[1.4rem] py-5 flex items-center justify-between">
        <UI.Skeleton className="h-8 w-32 rounded" />
        <div className="flex items-center gap-x-2">
          <UI.Skeleton className="h-8 w-48 rounded-full" />
          <UI.Skeleton className="h-8 w-24 rounded" />
        </div>
      </div>

      {/* Table data */}
      <div className="overflow-x-auto w-full scroll-bar">
        <UI.Table>
          <UI.TableHeader>
            <UI.TableRow>
              {tableHead.map((column, index) => (
                <UI.TableHead key={index}>{column}</UI.TableHead>
              ))}
            </UI.TableRow>
          </UI.TableHeader>

          <UI.TableBody>
            {[...Array(5)].map((_, rowIndex) => (
              <UI.TableRow key={rowIndex}>
                <UI.TableCell>
                  <UI.Skeleton className="h-4 w-full rounded" />
                </UI.TableCell>
                <UI.TableCell>
                  <UI.Skeleton className="h-4 w-full rounded" />
                </UI.TableCell>
                <UI.TableCell>
                  <UI.Skeleton className="h-4 w-full rounded" />
                </UI.TableCell>
                <UI.TableCell>
                  <div className="flex items-center gap-x-2 w-[10rem]">
                    <UI.Skeleton className="size-[2.2rem] rounded-full shrink-0" />
                    <UI.Skeleton className="h-4 w-full rounded" />
                  </div>
                </UI.TableCell>
                <UI.TableCell>
                  <UI.Skeleton className="h-4 w-full rounded" />
                </UI.TableCell>
                <UI.TableCell>
                  <UI.Skeleton className="h-4 w-full rounded" />
                </UI.TableCell>
                <UI.TableCell>
                  <UI.Skeleton className="h-4 w-full rounded" />
                </UI.TableCell>
                <UI.TableCell>
                  <UI.Skeleton className="h-4 w-full rounded" />
                </UI.TableCell>
                <UI.TableCell>
                  <UI.Skeleton className="h-5 w-full rounded-full" />
                </UI.TableCell>
              </UI.TableRow>
            ))}
          </UI.TableBody>
        </UI.Table>
      </div>
    </div>
  );
};
