import { UI } from "@/components/ui";
import { ChevronDown } from "lucide-react";
import { SelectRider } from "./SelectRider";

const InitiatePayout = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/finances", label: "Finances" },
          { href: "/finances/withdraw", label: "Withdraw" },
        ]}
        rootPageLink="/finances"
        currentPage="Initiate Payout"
      />
      <section className="bg-background mt-14 rounded-lg p-6">
        <UI.PrimaryHeading text="Initiate Payout" />
        <p className="text-primary-gray font-montserrat text-sm font-semibold">
          Payouts are made to riders on the app only. Funds will be sent to
          rider’s In-app wallet.
        </p>
        <form action="" className="mt-8 space-y-6">
          <div>
            <UI.Label
              htmlFor="Amount"
              className="text-xs flex justify-between mb-2"
            >
              Amount
              <span className="text-xs text-primary-gray font-montserrat">
                Current balance:{" "}
                <span className="text-[#1E1F1F] dark:text-white">$500,000</span>
              </span>
            </UI.Label>
            <UI.Input
              id="Amount"
              rightIcon={<UI.Button variant={"ghost"}>Max</UI.Button>}
            />
          </div>

          <UI.Select>
            <UI.SelectTrigger className="w-full h-10">
              <UI.SelectValue placeholder="Select User Type" />
            </UI.SelectTrigger>
            <UI.SelectContent>
              <UI.SelectGroup>
                <UI.SelectItem value="customer" className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="size-[1.96rem] rounded-full bg-primary/10" />
                    <span>Customer</span>
                  </div>
                </UI.SelectItem>
                <UI.SelectItem value="business" className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="size-[1.96rem] rounded-full bg-primary/10" />
                    <span>Business</span>
                  </div>
                </UI.SelectItem>
                <UI.SelectItem value="courier" className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="size-[1.96rem] rounded-full bg-primary/10" />
                    <span>Courier</span>
                  </div>
                </UI.SelectItem>
              </UI.SelectGroup>
            </UI.SelectContent>
          </UI.Select>
          <SelectRider />

          <UI.PrimaryButton disabled>Proceed</UI.PrimaryButton>
        </form>
      </section>
    </div>
  );
};
export default InitiatePayout;
