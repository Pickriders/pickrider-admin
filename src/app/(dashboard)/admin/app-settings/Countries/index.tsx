import { UI } from "@/components/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./DataTable";
import { Suspense } from "react";

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
        <Suspense>
          <DataTable />
        </Suspense>
      </div>
    </div>
  );
};
