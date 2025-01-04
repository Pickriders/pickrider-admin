import { UI } from "@/components/ui";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./Columns";
import { SVG } from "@/components/svg";

interface DataTableProps<TData> {
  data: TData[];
}

export const DataTable = <TData,>({ data }: DataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns: columns as ColumnDef<TData>[],
    getCoreRowModel: getCoreRowModel(),
    state: {},
  });

  return (
    <div>
      <UI.Table>
        <UI.TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <UI.TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <UI.TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </UI.TableHead>
                );
              })}
            </UI.TableRow>
          ))}
        </UI.TableHeader>

        <UI.TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <UI.TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <UI.TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </UI.TableCell>
                ))}
              </UI.TableRow>
            ))
          ) : (
            <UI.TableRow>
              <UI.TableCell
                colSpan={columns.length}
                className="h-24 text-center font-faktum-test font-semibold"
              >
                No results.
              </UI.TableCell>
            </UI.TableRow>
          )}
        </UI.TableBody>
      </UI.Table>

      <div className="flex items-center justify-between mt-6">
        <UI.Button
          variant={"ghost"}
          className="text-primary-gray font-montserrat"
        >
          <SVG.FilterIcon2 />
          Filter
          <SVG.ChevronDown className="fill-primary-gray" />
        </UI.Button>
        <UI.PaginationBtns currentPage={2} totalPages={4} />
      </div>
    </div>
  );
};
