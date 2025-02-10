"use client";

import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/services";

interface LoadingTableProps<TData> {
  columns: ColumnDef<TData, any>[];
}

const tableHead = ["", "S/N", "Courier Name", "Phone Number", "Address", "Liscence", "Date Joined", "Action"];

export const LoadingSkeleton = () => {
  return (
    <div className="bg-background rounded-lg  w-full">
      {/* Table data */}
      <div className="overflow-x-auto w-full scroll-bar">
        <UI.Table>
          <UI.TableBody>
            {[...Array(10)].map((_, rowIndex) => (
              <UI.TableRow key={rowIndex}>
                <UI.TableCell>
                  <UI.Skeleton className="h-4 w-[1.5rem] rounded" />
                </UI.TableCell>
                <UI.TableCell>
                  <UI.Skeleton className="h-4 w-full rounded" />
                </UI.TableCell>

                <UI.TableCell>
                  <div className="flex items-center gap-x-2 w-[10rem]">
                    <UI.Skeleton className="size-[2.2rem] rounded-full shrink-0" />
                    <div className="w-full">
                      <UI.Skeleton className="h-4 w-full rounded" />
                      <UI.Skeleton className="h-2 mt-1 w-full rounded" />
                    </div>
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
                  <div className="flex items-center gap-x-2">
                    <UI.Skeleton className="h-5 w-[2rem] rounded-full" />
                    <UI.Skeleton className="size-[1.5rem] rounded-full" />
                  </div>
                </UI.TableCell>
              </UI.TableRow>
            ))}
          </UI.TableBody>
        </UI.Table>
      </div>
    </div>
  );
};
