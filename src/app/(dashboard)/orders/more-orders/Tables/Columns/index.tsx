import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";

interface ColumnProps {}

export const columns: ColumnDef<ColumnProps>[] = [
  {
    accessorKey: "customer",
    header: "Customer name",
    cell: ({ row }) => <UI.TableUser name="Onyebuchi Ekene" subText="#43650" />,
  },
  {
    accessorKey: "orderType",
    header: "Order Type",
    cell: ({ row }) => <p>Batch Delivery</p>,
  },
  {
    accessorKey: "date",
    header: "Date/Time",
    cell: ({ row }) => {
      return <p>09/11/24 (20:08)</p>;
    },
  },
  {
    accessorKey: "courier",
    header: "Courier",
    cell: ({ row }) => {
      return <UI.TableUser name="Nnamani Kester" subText="ENU-1234" />;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      return <p>$2000</p>;
    },
  },
  {
    accessorKey: "distance",
    header: "Distance",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-6">
          30km
          <UI.Button size="icon" variant={"ghost"}>
            <SVG.TrackingIcon />
          </UI.Button>
        </div>
      );
    },
  },
];
