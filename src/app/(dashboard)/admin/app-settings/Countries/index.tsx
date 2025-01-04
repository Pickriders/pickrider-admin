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
      <ul className="mt-8 space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <li key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-x-6 text-sm font-semibold font-montserrat">
                <UI.Checkbox />
                <span>1.</span>
                <p>Nigeria</p>
              </div>
              <div className="flex items-center gap-x-2">
                <UI.Button size={"icon"} variant={"ghost"}>
                  <Trash2 color="#FF5244" size={20} />
                </UI.Button>
                <Link
                  href={`app-settings/${i}/country-details`}
                  className="size-[1.3rem] grid place-items-center rounded-full border"
                >
                  <ChevronRight size={12} />
                </Link>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};
