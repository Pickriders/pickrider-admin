import { UI } from "@/components/ui";

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

export const BusinessTableBulkAction = () => {
  return (
    <div className="flex items-center gap-x-2">
      <UI.Select>
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
      <UI.Button>Next</UI.Button>
    </div>
  );
};
