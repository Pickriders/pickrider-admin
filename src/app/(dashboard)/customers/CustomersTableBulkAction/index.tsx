"use client";

import { UI } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { DeleteCustomersModal } from "../DeleteCustomersModal";

type BulkActionProps =
  | "send email"
  | "suspend"
  | "send push notification"
  | "delete";

const bulkActions = [
  {
    label: "Send Email",
    value: "send email",
  },
  {
    label: "Suspend",
    value: "suspend",
  },
  {
    label: "Send Push Notification",
    value: "send push notification",
  },
  {
    label: "Delete",
    value: "delete",
  },
];

export const CustomersTableBulkAction = () => {
  const router = useRouter();
  const [action, setAction] = React.useState<BulkActionProps | "">("");

  function openDeletebusinessModal() {
    router.push("?delete-business=true");
  }
  function openSuspendCustomersModal() {
    router.push("?suspend-customers=true");
  }
  function pushNotification() {
    router.push("/customers/push-notification");
  }
  function email() {
    router.push("/customers/email");
  }

  function handleActionSelect(value: BulkActionProps) {
    setAction(value);
  }

  function excuteAction() {
    if (!action) return;
    if (action === "delete") {
      openDeletebusinessModal();
    } else if (action === "send push notification") {
      pushNotification();
    } else if (action === "send email") {
      email();
    } else if (action === "suspend") {
      openSuspendCustomersModal();
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
      <UI.Button onClick={excuteAction}>Next</UI.Button>
    </div>
  );
};
