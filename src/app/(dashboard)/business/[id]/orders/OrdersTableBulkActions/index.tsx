import { UI } from "@/components/ui";
import { useRouter } from "next/navigation";
import React from "react";

type BulkActionProps = "mark as complete" | "delete";

const bulkActions = [
  {
    label: "Mark as complete",
    value: "mark as complete",
  },
  {
    label: "Delete",
    value: "delete",
  },
];

export const OrdersTableBulkActions = () => {
  const router = useRouter();
  const [action, setAction] = React.useState<BulkActionProps | "">("");

  function openDeleteOrderModal() {
    router.push("?delete-orders=true");
  }

  function handleActionSelect(value: BulkActionProps) {
    setAction(value);
  }

  function excuteAction() {
    if (!action) return;
    if (action === "delete") {
      openDeleteOrderModal();
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
