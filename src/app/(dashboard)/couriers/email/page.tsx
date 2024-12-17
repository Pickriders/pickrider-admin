import { UI } from "@/components/ui";
import { MessageForm } from "./MessageForm";
import { SelectedBusinessTag } from "../SelectedBusinessTags";

const EmailPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/couriers", label: "Couriers" }]}
        rootPageLink="/couriers"
        currentPage="Email"
      />

      <section className="bg-background mt-14 px-7 py-10 rounded-lg">
        <h2 className="font-montserrat text-xs font-semibold text-foreground">
          Push Notification
        </h2>
        <div className="mt-9 ">
          <SelectedBusinessTag />
        </div>
        <MessageForm />
      </section>
    </div>
  );
};
export default EmailPage;
