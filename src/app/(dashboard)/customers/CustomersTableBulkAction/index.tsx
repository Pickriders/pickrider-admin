import { UI } from "@/components/ui";
import Link from "next/link";

export const CustomersTableBulkAction = () => {
  return (
    <div className="flex items-center gap-x-2">
      <UI.Select>
        <UI.SelectTrigger className="truncate w-32">
          <UI.SelectValue placeholder="Bulk Action" />
        </UI.SelectTrigger>
        <UI.SelectContent>
          <UI.SelectGroup className="">
            <UI.SelectItem value="send email">Send Email</UI.SelectItem>
            <UI.SelectItem value="send push notification">
              Send Push Notification
            </UI.SelectItem>
            <UI.SelectItem value="suspend">Suspend</UI.SelectItem>
            <UI.SelectItem value="delete">Delete</UI.SelectItem>
          </UI.SelectGroup>
        </UI.SelectContent>
      </UI.Select>
      <UI.Button asChild>
        <Link href={"/customers/push-notification"}>Next</Link>
      </UI.Button>
    </div>
  );
};
