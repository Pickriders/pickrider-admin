import { UI } from "@/components/ui";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

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
      <ol className="mt-8">
        <li className="flex items-center justify-between">
          <div className="flex items-center gap-x-6 text-sm font-semibold font-montserrat">
            <UI.Checkbox />
            <span>1.</span>
            <p>Nigeria</p>
          </div>
          <div className="flex items-center gap-x-2">
            <UI.Button size={"icon"} variant={"ghost"}>
              <Trash2 color="#FF5244" size={20} />
            </UI.Button>
            <button className="size-[1.3rem] grid place-items-center rounded-full border">
              <ChevronRight size={12} />
            </button>
          </div>
        </li>
      </ol>
    </div>
  );
};
