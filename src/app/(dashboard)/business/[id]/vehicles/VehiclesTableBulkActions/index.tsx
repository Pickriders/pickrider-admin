import { UI } from "@/components/ui";

type BulkActionProps =
  | "send email"
  | "suspend"
  | "send push notification"
  | "delete";

const bulkActions = [
  {
    label: "Delete",
    value: "delete",
  },
];

export const VehiclesTableBulkActions = () => {
  return (
    <div className="flex items-center gap-x-2">
      <UI.Select>
        <UI.SelectTrigger disabled className="truncate w-32">
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
      <UI.Button disabled>Next</UI.Button>
    </div>
  );
};
