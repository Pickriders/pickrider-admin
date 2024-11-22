import { UI } from "@/components/ui";
import { Tag } from "../Tag";
import { SVG } from "@/components/svg";
import { MessageForm } from "./MessageForm";

const PushNotificationPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        linkPage="Customers"
        rootPageLink="/customers"
        currentPage="Push Notification"
      />
      <section className="bg-background mt-10 px-7 py-6 rounded-lg">
        <h2 className="font-montserrat text-xs font-semibold text-foreground">
          Push Notification
        </h2>

        <div className="flex mt-9 items-center gap-x-4">
          {Array(10)
            .fill(0)
            .slice(0, 7)
            .map((_, i) => (
              <Tag key={i} />
            ))}
          <button className="bg-muted  px-4 transition-colors duration-300 hover:bg-neutral-300 dark:hover:bg-neutral-700/55 text-xs font-semibold font-montserrat rounded-2xl flex items-center justify-between h-9 w-[7.5rem]">
            +30 more <SVG.ChevronDown width={12} height={12} />
          </button>
        </div>

        <MessageForm />
      </section>
    </div>
  );
};
export default PushNotificationPage;
