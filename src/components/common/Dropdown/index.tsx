import { DropdownProps } from "./Dropdown.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export const Dropdown = ({
  trigger,
  children,
  side,
  marginLeft,
  marginRight,
}: DropdownProps) => {
  const styleProp = {
    marginLeft,
    marginRight,
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent style={styleProp} side={side}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
