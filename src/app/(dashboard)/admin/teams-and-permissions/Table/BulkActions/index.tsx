"use client";

import { UI } from "@/components/ui";
import { useRouter } from "next/navigation";
import React from "react";

type BulkActionProps = "send email" | "suspend" | "remove";

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
    label: "Remove",
    value: "remove",
  },
];

export const BulkActions = () => {
  const router = useRouter();
  const [action, setAction] = React.useState<BulkActionProps | "">("");

  const setParam = (param: string) =>
    router.push(`${param}`, { scroll: false });

  function openRemove() {
    setParam("?remove=true");
  }

  function openSuspend() {
    setParam("?suspend=true");
  }

  function email() {
    // router.push("/admin/email");
  }

  function handleActionSelect(value: BulkActionProps) {
    setAction(value);
  }

  function excuteAction() {
    if (!action) return;
    if (action === "remove") {
      openRemove();
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
