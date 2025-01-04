import { UI } from "@/components/ui";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const CountryDetailsPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/app-settings", label: "App settings" },
        ]}
        rootPageLink="/admin"
        currentPage="Country Details"
      />
      <section className="mt-12 bg-background rounded-2xl p-6">
        <div>
          <UI.PrimaryHeading text="Country Details" />
          <div className="mt-8">
            <div className="flex items-center gap-x-8">
              <UI.Input
                labelValue="Country name"
                id="Country name"
                defaultValue={"Nigeria"}
                className="w-[21rem]"
              />
              <UI.Input
                labelValue="Code"
                defaultValue={"+234"}
                id="Code"
                className="w-[21rem]"
              />
            </div>
            <div className="flex items-center mt-6 gap-x-8">
              <UI.Input
                defaultValue={"Naira"}
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
              <UI.PrimaryHeading text="States" />
              <UI.Button asChild>
                <Link href={"/admin/app-settings/add-state"}>
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
                  <Link
                    href={"state-details"}
                    className="size-[1.3rem] grid place-items-center rounded-full border"
                  >
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
export default CountryDetailsPage;
