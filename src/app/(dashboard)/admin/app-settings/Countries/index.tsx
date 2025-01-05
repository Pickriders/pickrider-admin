import { UI } from "@/components/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./Column";
import { DataTable } from "./DataTable";

export const Countries = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-clash-display font-semibold">Countries</h1>
        <UI.Button asChild>
          <Link href={"/admin/app-settings/add-country"}>
            <Plus size={13} /> Add Country
          </Link>
        </UI.Button>
      </div>
      <div className="mt-8">
        <DataTable columns={columns} data={Array(4).fill(0)} />
      </div>
    </div>
  );
};
