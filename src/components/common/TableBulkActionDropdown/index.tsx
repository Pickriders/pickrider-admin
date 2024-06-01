import { SVG } from "@/components/svg";
import { Dropdown } from "../Dropdown";
import { Container } from "../Container";
import { DropdownMenuItem } from "../Dropdown/dropdown-menu";
import style from "./styles.module.scss";

export const TableBulkActionDropdown = () => {
  return (
    <Dropdown
      trigger={
        <button className={style.actionDropdown}>
          <span>Bulk Action</span>
          <SVG.ChevronDown />
        </button>
      }
    >
      <Container width={106}>
        <DropdownMenuItem className={style.dropdownItem}>
          Send Email
        </DropdownMenuItem>
        <DropdownMenuItem className={style.dropdownItem}>
          Suspend
        </DropdownMenuItem>
        <DropdownMenuItem className={style.dropdownItem}>
          Delete
        </DropdownMenuItem>
      </Container>
    </Dropdown>
  );
};
