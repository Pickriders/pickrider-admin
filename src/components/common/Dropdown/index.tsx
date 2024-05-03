import { DropdownProps } from "./Dropdown.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export const Dropdown = ({ trigger, content }: DropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>{content}</DropdownMenuContent>
    </DropdownMenu>
  );
};
