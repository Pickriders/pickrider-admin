import { UI } from "@/components/ui";
import { useRouter } from "next/navigation";
import React from "react";

type BulkActionProps = "suspend" | "delete";

const bulkActions = [
  {
    label: "Suspend",
    value: "suspend",
  },
  {
    label: "Delete",
    value: "delete",
  },
];

export const VehiclesTableBulkActions = () => {
  const router = useRouter();
  const [action, setAction] = React.useState<BulkActionProps | "">("");

  function openDeleteVehicleModal() {
    router.push("?delete-vehicle=true");
  }

  function openSuspendVehicleModal() {
    router.push("?suspend-vehicle=true");
  }

  function handleActionSelect(value: BulkActionProps) {
    setAction(value);
  }

  function excuteAction() {
    if (!action) return;
    if (action === "delete") {
      openDeleteVehicleModal();
    } else if (action === "suspend") {
      openSuspendVehicleModal();
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
