import { SVG } from "@/components/svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import { Button } from "../Button";
import React from "react";
import { ActionProps } from "./TableBulkAction.type";

export const TableBulkAction = () => {
  return (
    <div className="flex items-center gap-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"} className="truncate">
            Bulk Action <SVG.ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Send Email</DropdownMenuItem>
          <DropdownMenuItem>Send Push Notification</DropdownMenuItem>
          <DropdownMenuItem>Suspend</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button>Next</Button>
    </div>
  );
};
