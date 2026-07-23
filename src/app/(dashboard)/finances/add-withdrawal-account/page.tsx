import { UI } from "@/components/ui";

const AddWithDrawalAccount = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/finances", label: "Finances" },
          { href: "withdraw", label: "Withdraw" },
        ]}
        rootPageLink="/finances"
        currentPage="Add Withdraw Account"
      />
      <section className="bg-background mt-14 rounded-lg p-6 ">
        <form action="">
          <div className="space-y-6">
            <div className="space-y-2">
              <UI.Label className="text-xs">Bank Name</UI.Label>
              <UI.Select>
                <UI.SelectTrigger>
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent></UI.SelectContent>
              </UI.Select>
            </div>
            <UI.Input
              labelValue="Account Number"
              labelClassName="mb-1"
              type="number"
              placeholder="Account Number"
              min={0}
            />
            <div className="space-y-2">
              <UI.Label className="text-xs">
                {" "}
                Who does this account belong to?
              </UI.Label>
              <UI.Select>
                <UI.SelectTrigger>
                  <UI.SelectValue />
                </UI.SelectTrigger>
                <UI.SelectContent></UI.SelectContent>
              </UI.Select>
            </div>
            <UI.Input
              labelValue="Account Name"
              labelClassName="mb-1"
              placeholder="Resolved automatically after account lookup"
              disabled
              min={0}
            />
            <UI.Input
              labelValue="BVN"
              labelClassName="mb-1"
              type="number"
              placeholder="Enter bank verification number"
              min={0}
            />
          </div>
          <p className="mt-8 text-xs text-primary-gray font-montserrat">
            Adding withdrawal accounts is not available yet — the core API has no endpoint for it. This form will go
            live once the backend ships one.
          </p>
          <div className="mt-6 flex items-center gap-x-4">
            <UI.PrimaryButton variant="outline">Cancel</UI.PrimaryButton>
            <UI.PrimaryButton disabled>Submit & Proceed</UI.PrimaryButton>
          </div>
        </form>
      </section>
    </div>
  );
};
export default AddWithDrawalAccount;
