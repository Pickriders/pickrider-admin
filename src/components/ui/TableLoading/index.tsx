"use client";

import { UI } from "@/components/ui";

interface TableLoadingProps {
  rowCount?: number;
  columnCount?: number;
}

export const TableLoading: React.FC<TableLoadingProps> = ({ rowCount = 5, columnCount = 5 }) => {
  return (
    <>
      {[...Array(rowCount)].map((_, rowIndex) => (
        <UI.TableRow key={rowIndex}>
          {[...Array(columnCount)].map((_, columnIndex) => (
            <UI.TableCell key={columnIndex}>
              <UI.Skeleton className="h-4 w-full rounded" />
            </UI.TableCell>
          ))}
        </UI.TableRow>
      ))}
    </>
  );
};
