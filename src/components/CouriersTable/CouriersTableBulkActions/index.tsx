import { UI } from "@/components/ui";
import { useRouter } from "next/navigation";
import React from "react";

type BulkActionProps = "send email" | "suspend" | "send push notification" | "delete";

const bulkActions = [
  {
    label: "Send Email",
    value: "send email",
  },
  {
    label: "Send Push Notification",
    value: "send push notification",
  },
  {
    label: "Suspend",
    value: "suspend",
  },
  {
    label: "Delete",
    value: "delete",
  },
];

export const CouriersTableBulkActions = () => {
  const router = useRouter();
  const [action, setAction] = React.useState<BulkActionProps | "">("");

  function openDelete() {
    router.push("?delete-courier=true");
  }

  function openSuspend() {
    router.push("?suspend-courier=true");
  }
  function pushNotification() {
    router.push("/couriers/push-notification");
  }
  function email() {
    router.push("/couriers/email");
  }

  function handleActionSelect(value: BulkActionProps) {
    setAction(value);
  }

  function excuteAction() {
    if (!action) return;
    if (action === "delete") {
      openDelete();
    } else if (action === "send push notification") {
      pushNotification();
    } else if (action === "send email") {
      email();
    } else if (action === "suspend") {
      openSuspend();
    }
  }

  return (
    <div className="flex items-center gap-x-2">
      <UI.Select onValueChange={handleActionSelect}>
        <UI.SelectTrigger className="truncate w-32">
          <UI.SelectValue placeholder="Bulk Action" />
        </UI.SelectTrigger>
        <UI.SelectContent>
          <UI.SelectGroup className="">
            {bulkActions.map((action, i) => (
              <UI.SelectItem key={i} value={action.value}>
                {action.label}
              </UI.SelectItem>
            ))}
          </UI.SelectGroup>
        </UI.SelectContent>
      </UI.Select>
      <UI.Button onClick={excuteAction} disabled={!action}>
        Next
      </UI.Button>
    </div>
  );
};
