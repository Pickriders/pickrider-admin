import { SelectProps } from "./Select.type";
import {
  Select as SelectBox,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export const Select = ({ items, placeholder, id }: SelectProps) => {
  return (
    <SelectBox>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item, i) => {
          return (
            <SelectItem key={i} value={`${item.value}`}>
              {item.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </SelectBox>
  );
};
