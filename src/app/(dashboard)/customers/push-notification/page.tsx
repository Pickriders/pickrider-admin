import { UI } from "@/components/ui";
import { MessageForm } from "./MessageForm";
import { SelectedCustomersTag } from "../SelectedCustomersTags";

const PushNotificationPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/customers", label: "Customers" }]}
        rootPageLink="/customers"
        currentPage="Push Notification"
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
export default PushNotificationPage;
