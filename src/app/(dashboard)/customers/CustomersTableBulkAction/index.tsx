import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const CustomersTableBulkAction = () => {
  return (
    <div className="flex items-center gap-x-2">
      <UI.DropdownMenu>
        <UI.DropdownMenuTrigger asChild>
          <UI.Button variant={"outline"} className="truncate">
            Bulk Action <SVG.ChevronDown />
          </UI.Button>
        </UI.DropdownMenuTrigger>
        <UI.DropdownMenuContent>
          <UI.DropdownMenuItem>Send Email</UI.DropdownMenuItem>
          <UI.DropdownMenuItem>Send Push Notification</UI.DropdownMenuItem>
          <UI.DropdownMenuItem>Suspend</UI.DropdownMenuItem>
          <UI.DropdownMenuItem>Delete</UI.DropdownMenuItem>
        </UI.DropdownMenuContent>
      </UI.DropdownMenu>
      <UI.Button>Next</UI.Button>
    </div>
  );
};
