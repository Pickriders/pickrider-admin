import { UI } from "@/components/ui";
import { MessageForm } from "./MessageForm";
import { SelectedCustomersTag } from "../SelectedCustomersTags";

const EmailPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        linkPage="Customers"
        rootPageLink="/customers"
        currentPage="Email"
      />
      <section className="bg-background mt-10 px-7 py-6 rounded-lg">
        <h2 className="font-montserrat text-xs font-semibold text-foreground">
          Push Notification
        </h2>
        <div className="mt-9 ">
          <SelectedCustomersTag />
        </div>

        <MessageForm />
      </section>
    </div>
  );
};
export default EmailPage;
