import { UI } from "@/components/ui";
import { WithdrawAccounts } from "./WithdrawAccounts";
import Link from "next/link";
import { Plus } from "lucide-react";

const WithdrawPage = () => {
  const haveWithdrawalAccounts = true;

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/finances", label: "Finances" }]}
        rootPageLink="/finances"
        currentPage="Withdraw"
      />
      <section className="bg-background mt-14 rounded-lg p-6 min-h-60">
        {haveWithdrawalAccounts ? (
          <WithdrawAccounts />
        ) : (
          <div>
            <UI.PrimaryHeading text=" Withdrawal Account" />
            <p className="text-primary-gray font-montserrat text-sm font-semibold">
              You are yet to add a withdrawal account. Click add below to add an
              account.
            </p>
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
          </div>
        )}
      </section>
    </div>
  );
};
export default WithdrawPage;
