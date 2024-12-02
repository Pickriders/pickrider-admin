import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

export type SelectedCustomersProps = {
  user: { img: string; name: string };
  status: "active" | "inactive" | "suspended";
  lastLogin: Date;
};

export const selectedCustomersColumns: ColumnDef<SelectedCustomersProps>[] = [
  {
    id: "select-all",
    header: ({ table }) => (
      <UI.Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <UI.Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    header: "S/N",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => <UI.TableUser name="Nnamani Kester" />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UI.TableStatus />,
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const date = row.getValue("lastLogin") as Date;

      return (
        <div>
          <p>{dayjs(date).format("h:mm a")}</p>
          <p className="mt-1">{dayjs(date).format("MM/DD/YY")}</p>
        </div>
      );
    },
  },
];
