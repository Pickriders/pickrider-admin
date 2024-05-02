import { SelectProps } from "./Select.type";
import {
  Select as SelectContainer,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export const Select = ({ items, id, placeholder, onChange }: SelectProps) => {
  return (
    <SelectContainer onValueChange={onChange}>
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
    </SelectContainer>
  );
};
