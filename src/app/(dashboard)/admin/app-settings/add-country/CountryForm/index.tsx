import { UI } from "@/components/ui";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export const CountryForm = () => {
  return (
    <div>
      <UI.PrimaryHeading text="Add country" />
      <div className="mt-8">
        <div className="flex items-center gap-x-8">
          <UI.Input
            labelValue="Country name"
            id="Country name"
            className="w-[21rem]"
          />
          <UI.Input labelValue="Code" id="Code" className="w-[21rem]" />
        </div>
        <div className="flex items-center mt-6 gap-x-8">
          <UI.Input
            labelValue="Currency name"
            id="Currency name"
            className="w-[21rem]"
          />
          <UI.Input
            labelValue="Currency symbol"
            id="Currency symbol"
            className="w-[21rem]"
            leftIcon={<UI.Button variant={"ghost"}>$</UI.Button>}
          />
          <div className="flex flex-col gap-y-1.5">
            <UI.Label className="text-xs font-montserrat">
              Exchange rate
            </UI.Label>
            <div className="flex  text-xs items-center gap-x-3 w-[21rem] border rounded-lg justify-between h-9 py-1 px-4">
              <span>$1</span>
              <span className="grow border-dashed border"></span>
              <span>N 1,700</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-x-4">
          <UI.PrimaryButton variant="outline" className="w-[10rem]">
            Back
          </UI.PrimaryButton>
          <UI.PrimaryButton className="w-[10rem]">Save</UI.PrimaryButton>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <UI.PrimaryHeading text="Add State" />
          <UI.Button asChild>
            <Link href={"add-state"}>
              <Plus size={13} /> Add State
            </Link>
          </UI.Button>
        </div>
        <ul className="mt-8">
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-x-6 text-sm font-semibold font-montserrat">
              <span>1.</span>
              <p>Enugu</p>
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
        </ul>
      </div>
    </div>
  );
};
