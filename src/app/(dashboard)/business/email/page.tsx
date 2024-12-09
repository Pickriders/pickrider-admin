import { UI } from "@/components/ui";
import { SelectedBusinessTag } from "../SelectedBusinessTags";
import { MessageForm } from "./MessageForm";

const EmailPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/business", label: "Business" }]}
        rootPageLink="/business"
        currentPage="Email"
      />

      <section className="bg-background mt-10 px-7 py-6 rounded-lg">
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
