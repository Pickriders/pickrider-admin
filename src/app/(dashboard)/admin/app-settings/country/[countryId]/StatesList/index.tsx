import { UI } from "@/components/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./DataTable";

interface StatesListProps {
  countryId: string;
}

export const StatesList: React.FC<StatesListProps> = (props) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-clash-display font-semibold">States</h1>
        <UI.Button asChild>
          <Link href={`/admin/app-settings/country/${props.countryId}/add-state`}>
            <Plus size={13} /> Add State
          </Link>
        </UI.Button>
      </div>
      <div className="mt-8">
        <DataTable countryId={props.countryId} />
      </div>
    </div>
  );
};
