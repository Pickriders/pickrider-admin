import { UI } from "@/components/ui";
import { WithdrawAccounts } from "./WithdrawAccounts";
import { Plus } from "lucide-react";
import Link from "next/link";

const WithdrawPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/finances", label: "Finances" }]}
        rootPageLink="/finances"
        currentPage="Withdraw"
      />
      <section className="bg-background mt-14 rounded-lg p-6">
        <WithdrawAccounts />
        <UI.PrimaryButton
          variant="outline"
          className="w-fit mt-5 mx-auto flex items-center gap-x-2 font-normal font-faktum-test"
          asChild
        >
          <Link href={"add-withdrawal-account"}>
            <Plus size={14} />
            Add Withdrawal Account
          </Link>
        </UI.PrimaryButton>
        <UI.PrimaryButton className="mt-5">Withdraw</UI.PrimaryButton>
      </section>
    </div>
  );
};
export default WithdrawPage;
